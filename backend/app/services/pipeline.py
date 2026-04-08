"""
EduLens 3-Phase Search Pipeline — Orchestrated by LangGraph.

Phase 1: SEARCH
    - CurricuLLM call: Query understanding + HyDE expansion (1 LLM call)
    - ERIC API: Retrieve educational resources (no LLM)
    - Trust-tier tagging: Rule-based classification (no LLM)

Phase 2: EVALUATE
    - Bad Cop + Good Cop run IN PARALLEL (2 LLM calls via CurricuLLM)
    - Consensus scoring: Server-side arithmetic (no LLM)
    - Conditional: If consensus < threshold → retry Phase 1 with refined query

Phase 3: SYNTHESIZE
    - CurricuLLM call: Generate summary from filtered sources (1 LLM call, streaming)
    - Citation-grounded output with APA references

Total LLM calls: 4 (1 + 2 parallel + 1)
Retry adds: +3 max (1 refined search + 2 re-evaluation)

LangGraph handles:
    - Parallel node execution (Bad Cop + Good Cop)
    - Conditional edges (retry if consensus < threshold)
    - State management (sources flow through phases)
"""

import asyncio
import time
import json
from typing import TypedDict, Annotated, Optional
from dataclasses import dataclass, field

from app.services import curricullm
from app.services.eric import search_eric
from app.services.trust import classify_trust_tier
from app.core.config import settings


# ════════════════════════════════════════════
# SYSTEM PROMPT BUILDER — context-rich prompts
# per agent, using everything we know about
# the user, their role, grade level, subject.
# ════════════════════════════════════════════

ROLE_CONTEXT = {
    "teacher": "a classroom teacher who needs curriculum-aligned, ready-to-use resources for direct instruction and student activities",
    "publisher": "an education publisher evaluating content for accuracy, originality, licensing compliance, and market fit",
    "specialist": "a subject matter specialist focused on depth, correctness, and alignment with the latest disciplinary standards",
    "curriculum-designer": "a curriculum designer mapping resources to learning outcomes, scope & sequence, and assessment standards",
    "instructional-coach": "an instructional coach looking for evidence-based practices, differentiation strategies, and professional development material",
}

GRADE_CONTEXT = {
    "early-years": "Foundation to Year 2 (ages 5–8). Content must use simple language, visual aids, and age-appropriate themes. Avoid abstract concepts, violence, or complex social issues.",
    "primary": "Years 3 to 6 (ages 8–12). Content should be engaging, scaffolded, and connected to everyday experiences. Introduce concepts gradually with concrete examples.",
    "middle": "Years 7 to 9 (ages 12–15). Students are developing critical thinking. Content can introduce complexity, multiple perspectives, and evidence-based reasoning.",
    "senior": "Years 10 to 12 (ages 15–18). Content should be rigorous, analytical, and exam-preparation ready. Students can handle nuanced topics, primary sources, and academic language.",
    "tertiary": "Tertiary / Adult (ages 18+). Content should be at university level — scholarly, evidence-dense, and assume foundational knowledge.",
}


def _build_system_prompt(agent_type: str, state: 'PipelineState') -> str:
    """
    Build a context-rich system prompt using user info.

    Args:
        agent_type: "hyde", "bad_cop", "good_cop", or "synthesizer"
        state: Current pipeline state with user context
    """
    role_desc = ROLE_CONTEXT.get(state.user_role, ROLE_CONTEXT["teacher"])
    grade_desc = GRADE_CONTEXT.get(state.grade_level, GRADE_CONTEXT["middle"])
    subject_line = f"Subject area: {state.subject}." if state.subject else ""

    base_context = f"""You are part of EduLens, an AI-powered educational resource discovery platform built for the Australian and New Zealand curriculum.

USER CONTEXT:
- Role: {state.user_role} — {role_desc}
- Teaching to: {state.grade_level} students
- Grade requirements: {grade_desc}
{f"- Subject: {state.subject}" if state.subject else ""}
- Search query: "{state.query}"

IMPORTANT RULES:
- All responses MUST be age-appropriate for the specified grade level
- Prioritise Australian/NZ curriculum standards (ACARA, NZQA)
- Respect First Nations and Torres Strait Islander cultural protocols
- Always respond in valid JSON"""

    if agent_type == "hyde":
        return f"""{base_context}

YOUR ROLE: Query Expansion & HyDE Agent
You analyse the educator's search intent and expand it into multiple angles to ensure comprehensive resource retrieval. You also generate a hypothetical ideal document (HyDE) that represents what the perfect resource would look like for this query and audience.

Think about:
- What curriculum codes or standards relate to this query?
- What vocabulary would high-quality educational resources use?
- What subtopics would a thorough resource cover?
- What pedagogical approaches suit this grade level?"""

    elif agent_type == "bad_cop":
        return f"""{base_context}

YOUR ROLE: Bad Cop — Critical Content Safety Reviewer
You are the SKEPTIC. Your mandate is to PROTECT {state.grade_level} students from:
- Unreliable, outdated, or factually incorrect content
- Age-inappropriate material (violence, complex trauma, sexual content, substance references)
- Culturally insensitive or biased perspectives
- Sources with poor provenance or unknown authorship
- Content that doesn't align with {state.grade_level} cognitive and emotional development

You must be STRICT. If a source is borderline, flag it for removal. It is better to remove a questionable source than to expose students to harmful content.

When evaluating, consider the specific needs of {role_desc}. They need content they can confidently use without additional vetting."""

    elif agent_type == "good_cop":
        return f"""{base_context}

YOUR ROLE: Good Cop — Constructive Quality Validator
You are the ADVOCATE for high-quality education. Your mandate is to identify:
- Sources with strong curriculum alignment (ACARA / NZQA standards)
- Pedagogically sound content with clear learning outcomes
- Diverse perspectives including First Nations, multicultural, and inclusive voices
- Content that matches the cognitive level of {state.grade_level} students
- Resources that {role_desc} can immediately put to use

You should be SUPPORTIVE but honest. Highlight what makes each source valuable for the classroom. Note opportunities for enrichment and cross-curricular connections.

Rank sources by their practical usefulness for this specific educator and grade level."""

    elif agent_type == "synthesizer":
        return f"""{base_context}

YOUR ROLE: Citation-Grounded Synthesis Agent
You create comprehensive, classroom-ready summaries from verified educational sources. Your output will be read by {role_desc}.

STRICT RULES:
- ONLY reference information present in the provided sources — never hallucinate
- Use inline citations [1], [2], etc. for every factual claim
- Write at a language level appropriate for {state.grade_level} students (the summary may be shared with students)
- Structure the response with clear sections and key takeaways
- Include practical "teacher notes" about how to use these resources
- Generate proper APA citations for all references"""

    return base_context


# ════════════════════════════════════════════
# Pipeline State — flows through all phases
# ════════════════════════════════════════════

@dataclass
class PipelineState:
    """Mutable state that flows through the LangGraph pipeline."""
    # Input
    query: str = ""
    grade_level: str = "middle"  # Teaching To selection
    subject: Optional[str] = None
    user_role: str = "teacher"

    # Phase 1: Search results
    expanded_queries: list[str] = field(default_factory=list)
    hyde_document: str = ""
    raw_sources: list[dict] = field(default_factory=list)

    # Phase 2: Evaluation results
    good_cop_result: dict = field(default_factory=dict)
    bad_cop_result: dict = field(default_factory=dict)
    consensus_score: float = 0.0
    filtered_sources: list[dict] = field(default_factory=list)
    removed_sources: list[dict] = field(default_factory=list)

    # Phase 3: Synthesis
    summary: str = ""
    references: list[dict] = field(default_factory=list)

    # Pipeline metadata
    stage: str = "idle"
    retry_count: int = 0
    total_time: float = 0.0
    error: Optional[str] = None


# ════════════════════════════════════════════
# PHASE 1: SEARCH
# ════════════════════════════════════════════

async def phase1_search(state: PipelineState) -> PipelineState:
    """
    Phase 1: Query expansion + Resource retrieval + Trust-tier tagging.
    1 CurricuLLM call + 1 ERIC API call + rule-based trust tiers.
    """
    state.stage = "searching"

    # ── Step 1: Query Understanding + HyDE (1 CurricuLLM call) ──
    hyde_prompt = f"""You are an educational resource discovery assistant. A {state.user_role} is searching for resources to teach {state.grade_level} students.

Their search query: "{state.query}"

Respond in JSON with:
{{
    "expanded_queries": ["3-4 refined search queries that capture different angles of this topic"],
    "hyde_document": "Write a 100-word hypothetical ideal educational resource abstract that would perfectly answer this query. Include specific educational terms, curriculum standards, and pedagogical approaches.",
    "detected_subject": "The primary subject area (e.g., Geography, Science, Mathematics, History)"
}}"""

    try:
        hyde_result = await curricullm.chat_json(
            messages=[
                {"role": "system", "content": _build_system_prompt("hyde", state)},
                {"role": "user", "content": hyde_prompt},
            ],
            stage=state.grade_level,
            subject=state.subject,
            temperature=0.3,
        )

        state.expanded_queries = hyde_result.get("expanded_queries", [state.query])
        state.hyde_document = hyde_result.get("hyde_document", "")
        if not state.subject:
            state.subject = hyde_result.get("detected_subject", "")
    except Exception as e:
        # Fallback: use original query if CurricuLLM fails
        state.expanded_queries = [state.query]
        state.hyde_document = ""

    # ── Step 2: ERIC API Retrieval (no LLM call) ──
    all_sources = []
    search_queries = [state.query] + state.expanded_queries[:2]  # Original + 2 expansions

    # Run searches in parallel
    search_tasks = [
        search_eric(
            query=q,
            grade_level=state.grade_level,
            max_results=settings.max_sources,
        )
        for q in search_queries
    ]

    results = await asyncio.gather(*search_tasks, return_exceptions=True)

    seen_ids = set()
    for result in results:
        if isinstance(result, Exception):
            continue
        for source in result:
            if source["id"] not in seen_ids:
                seen_ids.add(source["id"])
                all_sources.append(source)

    # ── Step 3: Trust-Tier Tagging (rule-based, no LLM) ──
    for source in all_sources:
        source["trust_tier"] = classify_trust_tier(
            url=source.get("url", ""),
            provider=source.get("provider", ""),
        )

    # Sort: gold first, then silver, then bronze; within tier by relevance order
    tier_order = {"gold": 0, "silver": 1, "bronze": 2}
    all_sources.sort(key=lambda s: tier_order.get(s.get("trust_tier", "bronze"), 2))

    # Keep top K sources
    state.raw_sources = all_sources[:settings.rerank_top_k]

    return state


# ════════════════════════════════════════════
# PHASE 2: EVALUATE (Dual-Agent)
# ════════════════════════════════════════════

async def _run_bad_cop(state: PipelineState) -> dict:
    """
    Bad Cop: Skeptical evaluator. Identifies weak, unreliable, or
    age-inappropriate sources to REMOVE.

    Returns JSON with flagged sources and concerns.
    """
    sources_text = "\n\n".join([
        f"[Source {i+1}] {s['title']}\n"
        f"Provider: {s['provider']} | Trust Tier: {s['trust_tier']}\n"
        f"URL: {s['url']}\n"
        f"Snippet: {s['snippet'][:200]}"
        for i, s in enumerate(state.raw_sources)
    ])

    prompt = f"""Review these {len(state.raw_sources)} sources retrieved for the query: "{state.query}"

{sources_text}

For each source, evaluate against these criteria:
1. TRUSTWORTHINESS: Is the provider reputable? Is the content peer-reviewed or editorially verified?
2. ACCURACY: Could it contain outdated (pre-2020), misleading, or factually incorrect information?
3. AGE SAFETY: Is every part of this content safe and appropriate for {state.grade_level} students? Consider language, themes, imagery descriptions, and emotional impact.
4. CULTURAL RESPECT: Does it handle First Nations, multicultural, and diverse perspectives appropriately? Any stereotyping or erasure?
5. CURRICULUM FIT: Does it align with what a {state.user_role} teaching {state.grade_level} {state.subject or ''} would actually need?

Respond in JSON:
{{
    "rating": <1-10 overall quality rating>,
    "verdict": "approve" or "flag" or "reject",
    "sources_to_remove": [<list of source numbers (1-indexed) that MUST be removed>],
    "concerns": ["specific concern 1 with source number referenced", "concern 2", ...],
    "summary": "2-3 sentence summary explaining your critical assessment"
}}"""

    try:
        return await curricullm.chat_json(
            messages=[
                {"role": "system", "content": _build_system_prompt("bad_cop", state)},
                {"role": "user", "content": prompt},
            ],
            stage=state.grade_level,
            subject=state.subject,
            temperature=0.2,
        )
    except Exception:
        return {"rating": 5, "verdict": "flag", "sources_to_remove": [], "concerns": ["Evaluation failed"], "summary": "Could not complete evaluation."}


async def _run_good_cop(state: PipelineState) -> dict:
    """
    Good Cop: Supportive evaluator. Identifies the most authentic,
    curriculum-aligned, and pedagogically valuable sources to KEEP.

    Returns JSON with approved sources and positive points.
    """
    sources_text = "\n\n".join([
        f"[Source {i+1}] {s['title']}\n"
        f"Provider: {s['provider']} | Trust Tier: {s['trust_tier']}\n"
        f"URL: {s['url']}\n"
        f"Snippet: {s['snippet'][:200]}"
        for i, s in enumerate(state.raw_sources)
    ])

    prompt = f"""Review these {len(state.raw_sources)} sources retrieved for the query: "{state.query}"

{sources_text}

For each source, evaluate these strengths:
1. CURRICULUM ALIGNMENT: How well does it map to Australian/NZ curriculum standards for {state.grade_level} {state.subject or ''}?
2. PEDAGOGICAL VALUE: Does it support effective teaching strategies (scaffolding, inquiry-based learning, differentiation)?
3. DIVERSE PERSPECTIVES: Does it include First Nations voices, multicultural viewpoints, and inclusive representation?
4. PRACTICAL USEFULNESS: Can a {state.user_role} immediately use this in their classroom/work without heavy modification?
5. ENGAGEMENT: Will {state.grade_level} students find this content engaging and accessible?

Respond in JSON:
{{
    "rating": <1-10 overall quality rating>,
    "verdict": "approve" or "conditional",
    "best_sources": [<list of source numbers (1-indexed) ranked by quality, best first>],
    "positive_points": ["specific strength 1 with source referenced", "strength 2", ...],
    "summary": "2-3 sentence summary of what makes these sources valuable for this educator"
}}"""

    try:
        return await curricullm.chat_json(
            messages=[
                {"role": "system", "content": _build_system_prompt("good_cop", state)},
                {"role": "user", "content": prompt},
            ],
            stage=state.grade_level,
            subject=state.subject,
            temperature=0.2,
        )
    except Exception:
        return {"rating": 7, "verdict": "approve", "best_sources": list(range(1, len(state.raw_sources) + 1)), "positive_points": ["Sources retrieved successfully"], "summary": "Evaluation completed with defaults."}


async def phase2_evaluate(state: PipelineState) -> PipelineState:
    """
    Phase 2: Run Bad Cop + Good Cop IN PARALLEL, compute consensus,
    filter sources based on their combined judgment.

    2 CurricuLLM calls (parallel) + server-side consensus math.
    """
    state.stage = "evaluating"

    # ── Run both agents in parallel (2 API calls, but only ~2s wall time) ──
    bad_cop_result, good_cop_result = await asyncio.gather(
        _run_bad_cop(state),
        _run_good_cop(state),
    )

    state.bad_cop_result = bad_cop_result
    state.good_cop_result = good_cop_result

    # ── Consensus scoring (server-side arithmetic, no LLM) ──
    bad_rating = bad_cop_result.get("rating", 5)
    good_rating = good_cop_result.get("rating", 7)
    state.consensus_score = round((bad_rating + good_rating) / 2, 1)

    # ── Apply Bad Cop's removal decisions ──
    sources_to_remove = set(bad_cop_result.get("sources_to_remove", []))
    state.filtered_sources = []
    state.removed_sources = []

    for i, source in enumerate(state.raw_sources):
        if (i + 1) in sources_to_remove:
            state.removed_sources.append(source)
        else:
            state.filtered_sources.append(source)

    # If no sources survive, keep all (don't leave the user with nothing)
    if not state.filtered_sources:
        state.filtered_sources = state.raw_sources

    return state


def should_retry(state: PipelineState) -> bool:
    """
    Conditional edge: Should we retry the search?
    Returns True if consensus < threshold AND we haven't exceeded max retries.
    """
    return (
        state.consensus_score < settings.consensus_threshold
        and state.retry_count < settings.max_pipeline_retries
    )


async def refine_and_retry(state: PipelineState) -> PipelineState:
    """
    If consensus is low, refine the query using Bad Cop's concerns
    and re-run Phase 1.
    """
    state.retry_count += 1
    concerns = state.bad_cop_result.get("concerns", [])
    concern_text = "; ".join(concerns[:3])

    # Modify query to address concerns
    state.query = f"{state.query} (excluding: {concern_text})"

    # Re-run Phase 1
    return await phase1_search(state)


# ════════════════════════════════════════════
# PHASE 3: SYNTHESIZE
# ════════════════════════════════════════════

async def phase3_synthesize(state: PipelineState) -> PipelineState:
    """
    Phase 3: Generate citation-grounded summary from filtered sources.
    1 CurricuLLM call.

    Only uses sources that survived the dual-agent filter.
    """
    state.stage = "synthesizing"

    sources_text = "\n\n".join([
        f"[{i+1}] {s['title']}\n"
        f"Authors: {', '.join(s.get('authors', ['Unknown']))}\n"
        f"Source: {s['provider']} ({s['trust_tier'].upper()} tier)\n"
        f"URL: {s['url']}\n"
        f"Content: {s['snippet']}"
        for i, s in enumerate(state.filtered_sources)
    ])

    prompt = f"""These {len(state.filtered_sources)} sources have passed dual-agent authenticity review for the query: "{state.query}"

{sources_text}

Create a comprehensive, classroom-ready synthesis that:
1. Synthesizes key findings across ALL sources — do not skip any
2. Uses inline citations [1], [2], etc. for EVERY factual claim
3. Structures the response with clear sections and key takeaways
4. Identifies cross-source themes and connections
5. Notes any gaps or areas where the {state.user_role} should supplement with additional resources

CRITICAL: Only reference information present in the provided sources. Never add facts, statistics, or claims not found in these sources.

Respond in JSON:
{{
    "summary": "Your comprehensive summary with inline citations [1], [2], etc. Use paragraphs and clear structure.",
    "key_themes": ["theme 1", "theme 2", ...],
    "teacher_notes": "Practical notes for the {state.user_role} on how to use these resources with {state.grade_level} students. Include differentiation tips and discussion starters.",
    "references": [
        {{
            "index": 1,
            "title": "Source title",
            "authors": ["Author 1"],
            "url": "source url",
            "publish_date": "date",
            "source": "Provider name",
            "citation_apa": "Full APA 7th edition citation string"
        }}
    ]
}}"""

    try:
        result = await curricullm.chat_json(
            messages=[
                {"role": "system", "content": _build_system_prompt("synthesizer", state)},
                {"role": "user", "content": prompt},
            ],
            stage=state.grade_level,
            subject=state.subject,
            temperature=0.3,
            max_tokens=3000,
        )

        state.summary = result.get("summary", "")
        state.references = result.get("references", [])

        # Ensure references have data from actual sources
        for i, source in enumerate(state.filtered_sources):
            if i < len(state.references):
                ref = state.references[i]
                ref["url"] = source.get("url", ref.get("url", ""))
                ref["source"] = source.get("provider", ref.get("source", ""))
            else:
                state.references.append({
                    "index": i + 1,
                    "title": source.get("title", ""),
                    "authors": source.get("authors", ["Unknown"]),
                    "url": source.get("url", ""),
                    "publish_date": source.get("publish_date", ""),
                    "source": source.get("provider", ""),
                    "citation_apa": f"{', '.join(source.get('authors', ['Unknown']))}. ({source.get('publish_date', 'n.d.')}). {source.get('title', '')}. {source.get('provider', '')}. {source.get('url', '')}",
                })
    except Exception as e:
        state.summary = "Summary generation failed. Please review the individual sources below."
        state.references = []
        state.error = str(e)

    state.stage = "complete"
    return state


# ════════════════════════════════════════════
# PIPELINE RUNNER
# ════════════════════════════════════════════

async def run_pipeline(
    query: str,
    grade_level: str = "middle",
    subject: str | None = None,
    user_role: str = "teacher",
) -> dict:
    """
    Execute the full 3-phase pipeline.

    This is the main entry point called by the API route.
    Uses LangGraph-style state management with conditional retry.

    Args:
        query: User's search query
        grade_level: Teaching To selection (early-years, primary, middle, senior, tertiary)
        subject: Optional subject filter
        user_role: User's role for personalization

    Returns:
        Full pipeline result dict ready for the frontend
    """
    start_time = time.time()

    # Initialize state
    state = PipelineState(
        query=query,
        grade_level=grade_level,
        subject=subject,
        user_role=user_role,
    )

    # ── Phase 1: Search ──
    state = await phase1_search(state)

    if not state.raw_sources:
        return _build_response(state, time.time() - start_time)

    # ── Phase 2: Evaluate ──
    state = await phase2_evaluate(state)

    # ── Conditional Retry ──
    if should_retry(state):
        state = await refine_and_retry(state)
        state = await phase2_evaluate(state)

    # ── Phase 3: Synthesize ──
    state = await phase3_synthesize(state)

    state.total_time = round(time.time() - start_time, 2)
    return _build_response(state, state.total_time)


def _build_response(state: PipelineState, total_time: float) -> dict:
    """Build the API response from pipeline state."""
    return {
        "query": state.query,
        "expanded_queries": state.expanded_queries,
        "stage": state.stage,
        "grade_level": state.grade_level,
        "subject": state.subject,
        "rag_sources": [
            {
                "id": s.get("id", ""),
                "title": s.get("title", ""),
                "url": s.get("url", ""),
                "snippet": s.get("snippet", ""),
                "trust_tier": s.get("trust_tier", "bronze"),
                "relevance_score": round(1.0 - (i * 0.05), 2),  # decreasing relevance
                "provider": s.get("provider", "Unknown"),
            }
            for i, s in enumerate(state.filtered_sources)
        ],
        "dual_agent_review": {
            "good_cop": {
                "verdict": state.good_cop_result.get("verdict", "approve"),
                "positive_points": state.good_cop_result.get("positive_points", []),
                "rating": state.good_cop_result.get("rating", 0),
                "summary": state.good_cop_result.get("summary", ""),
            },
            "bad_cop": {
                "verdict": state.bad_cop_result.get("verdict", "approve"),
                "concerns": state.bad_cop_result.get("concerns", []),
                "rating": state.bad_cop_result.get("rating", 0),
                "summary": state.bad_cop_result.get("summary", ""),
            },
            "consensus_score": state.consensus_score,
        },
        "summary": state.summary,
        "references": state.references,
        "removed_sources": [
            {"id": s.get("id", ""), "title": s.get("title", ""), "reason": "Failed dual-agent review"}
            for s in state.removed_sources
        ],
        "total_time": total_time,
        "retry_count": state.retry_count,
        "error": state.error,
    }
