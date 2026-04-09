"""
EduLens Search Pipeline — 4-phase CurricuLLM pipeline.

Phase 1: HyDE Query Expansion → ERIC retrieval (3 parallel) → Trust-tier tagging
Phase 2: Bad Cop + Good Cop (parallel) → Consensus scoring → Optional retry
Phase 3: Citation-Grounded Synthesis
"""

import asyncio
import logging
import time
import hashlib
from typing import Optional
from dataclasses import dataclass, field
from urllib.parse import urlparse

import httpx

from app.core.config import settings
from app.services.curricullm import (
    chat_json,
    is_available,
    GRADE_TO_STAGE,
    GRADE_DESCRIPTIONS,
)

logger = logging.getLogger("edulens.pipeline")

# ---------------------------------------------------------------------------
# ERIC education level mapping
# ---------------------------------------------------------------------------
ERIC_EDUCATION_LEVELS = {
    "early": "Early Childhood Education",
    "primary": "Elementary Education",
    "middle": "Middle Schools",
    "senior": "High Schools",
    "tertiary": "Higher Education",
}

ERIC_BASE = settings.eric_base_url

# ---------------------------------------------------------------------------
# Trust tier classification — domain whitelist, server-side only (<1ms)
# ---------------------------------------------------------------------------
_GOLD_EXACT = frozenset({
    "eric.ed.gov",
    "oercommons.org",
    "aiatsis.gov.au",
    "csiro.au",
})
_GOLD_SUFFIXES = (".gov.au", ".govt.nz")
_SILVER_EXACT = frozenset({
    "education.abc.net.au",
    "khanacademy.org",
})
_SILVER_SUFFIXES = (".edu.au", ".edu")
_TIER_ORDER = {"gold": 0, "silver": 1, "bronze": 2}


def classify_trust_tier(url: str) -> str:
    """Classify a URL into gold / silver / bronze trust tier."""
    try:
        host = urlparse(url).netloc.lower().lstrip("www.")
    except Exception:
        return "bronze"

    if host in _GOLD_EXACT:
        return "gold"
    for suffix in _GOLD_SUFFIXES:
        if host.endswith(suffix):
            return "gold"
    if host in _SILVER_EXACT:
        return "silver"
    for suffix in _SILVER_SUFFIXES:
        if host.endswith(suffix):
            return "silver"
    return "bronze"


# ---------------------------------------------------------------------------
# ERIC API helper
# ---------------------------------------------------------------------------

async def fetch_eric_sources(query: str, rows: int = 10, grade_level: str = "middle") -> list[dict]:
    """
    Query the ERIC API for peer-reviewed education research.
    ERIC only supports plain-text search — enriches the query with grade-level
    terms so results are more relevant to the target year level.
    Returns sources with trust_tier already classified.
    """
    # Enrich query with grade-level context (plain text — ERIC doesn't support field filters)
    grade_term = ERIC_EDUCATION_LEVELS.get(grade_level, "middle school")
    eric_query = f"{query} {grade_term}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                ERIC_BASE,
                params={"search": eric_query, "format": "json", "rows": rows},
            )
            resp.raise_for_status()
            data = resp.json()

        docs = data.get("response", {}).get("docs", [])
        sources: list[dict] = []
        for i, doc in enumerate(docs):
            eric_id = doc.get("id", f"eric-{i}")
            url = f"https://eric.ed.gov/?id={eric_id}"
            authors = doc.get("author", [])
            author_str = authors[0] if isinstance(authors, list) and authors else None
            subjects = doc.get("subject", [])
            subject_str = subjects[0] if isinstance(subjects, list) and subjects else "Education"

            sources.append({
                "id": f"eric-{hashlib.md5(eric_id.encode()).hexdigest()[:8]}",
                "eric_id": eric_id,  # kept for dedup
                "title": doc.get("title", "Untitled"),
                "url": url,
                "provider": "ERIC",
                "snippet": (doc.get("description", "") or "")[:300],
                "trust_tier": classify_trust_tier(url),
                "relevance_score": max(60, 95 - i * 5),
                "quality_score": max(70, 90 - i * 3),
                "type": "article",
                "subject": subject_str,
                "grade_level": grade_level,
                "license": "Public Domain",
                "author": author_str,
                "publish_date": str(doc.get("publicationdateyear", "2024")),
            })
        return sources
    except Exception as e:
        logger.warning("ERIC API failed: %s", e)
        return []


# ---------------------------------------------------------------------------
# Pipeline state
# ---------------------------------------------------------------------------
@dataclass
class PipelineState:
    query: str
    grade_level: str
    subject: Optional[str] = None
    user_role: str = "teacher"
    classroom_context: Optional[dict] = None
    retry_count: int = 0
    # Populated during pipeline
    expanded_queries: list[str] = field(default_factory=list)
    hyde_document: str = ""
    detected_subject: str = ""
    raw_sources: list[dict] = field(default_factory=list)  # before dedup/sort
    rag_sources: list[dict] = field(default_factory=list)  # final sorted sources
    bad_cop_result: Optional[dict] = None
    good_cop_result: Optional[dict] = None
    synthesis: Optional[dict] = None

    @property
    def stage(self) -> str:
        return GRADE_TO_STAGE.get(self.grade_level, "Years 7 to 9")

    @property
    def grade_desc(self) -> str:
        return GRADE_DESCRIPTIONS.get(self.grade_level, GRADE_DESCRIPTIONS["middle"])


# ---------------------------------------------------------------------------
# System prompt builder
# ---------------------------------------------------------------------------

_ROLE_DESCRIPTIONS = {
    "teacher": "a classroom teacher who needs curriculum-aligned, ready-to-use resources",
    "curriculum_lead": "a curriculum coordinator overseeing teaching quality and standards alignment",
    "parent": "a parent seeking educational resources to support their child's learning",
    "student": "a student looking for study resources",
}


def _build_system_prompt(agent: str, state: PipelineState) -> str:
    role_desc = _ROLE_DESCRIPTIONS.get(state.user_role, _ROLE_DESCRIPTIONS["teacher"])

    base = f"""You are part of EduLens, an AI-powered educational resource discovery platform.

USER CONTEXT:
- Role: {state.user_role} — {role_desc}
- Teaching to: {state.grade_level} students
- Grade requirements: {state.grade_desc}
- Subject: {state.detected_subject or state.subject or 'Not specified'}
- Search query: "{state.query}"
"""

    ctx = state.classroom_context or {}
    if any(ctx.values()):
        base += "\nCLASSROOM LOCALISATION CONTEXT:\n"
        field_map = {
            "schoolName": "School",
            "town": "Town",
            "state": "State",
            "country": "Country",
            "firstNationsContext": "First Nations context",
            "localLandmarks": "Local landmarks & geography",
            "localSportsTeams": "Local sports teams",
            "localArtistsMusic": "Local artists & music",
            "communityProjects": "Community projects",
            "culturalFigures": "Cultural figures & role models",
            "studentInterests": "Student interests",
            "languageBackgrounds": "Language backgrounds in class",
            "localDataSources": "Local data sources",
        }
        for key, label in field_map.items():
            val = ctx.get(key)
            if val:
                if isinstance(val, list):
                    val = ", ".join(val) if val else None
                if val:
                    base += f"- {label}: {val}\n"

    base += """
IMPORTANT RULES:
- All responses MUST be age-appropriate for the specified grade level
- Prioritise Australian/NZ curriculum standards (ACARA, NZQA)
- Respect First Nations and Torres Strait Islander cultural protocols
- Always respond in valid JSON
"""

    agent_roles = {
        "hyde": """
YOUR ROLE: Query Expansion & HyDE Agent
You analyse the educator's search intent and expand it into multiple angles.
Think about:
- What curriculum codes or standards relate to this query?
- What vocabulary would high-quality educational resources use?
- What subtopics would a thorough resource cover?
- What pedagogical approaches suit this grade level?
""",
        "bad_cop": f"""
YOUR ROLE: Bad Cop — Critical Content Safety Reviewer
You are the SKEPTIC. Your mandate is to PROTECT {state.grade_level} students from:
- Unreliable, outdated, or factually incorrect content
- Age-inappropriate material
- Culturally insensitive or biased perspectives
- Sources with poor provenance or unknown authorship
- Content that doesn't align with {state.grade_level} cognitive and emotional development

VISUAL & MEDIA SAFETY (IMPORTANT):
Assess the RISK of unsafe visual content based on source type, provider reputation, and topic sensitivity.
Be STRICT. If a source is borderline, flag it for removal.
""",
        "good_cop": f"""
YOUR ROLE: Good Cop — Constructive Quality Validator
You are the ADVOCATE for high-quality education. Identify:
- Sources with strong curriculum alignment (ACARA / NZQA standards)
- Pedagogically sound content with clear learning outcomes
- Diverse perspectives including First Nations, multicultural, and inclusive voices
- Content that matches the cognitive level of {state.grade_level} students
- Resources that a classroom teacher can immediately put to use

Be SUPPORTIVE but honest. Rank sources by practical usefulness.
""",
        "synthesizer": """
YOUR ROLE: Citation-Grounded Synthesis Agent
You create comprehensive, classroom-ready summaries from verified educational sources.

STRICT RULES:
- ONLY reference information present in the provided sources — never hallucinate
- Use inline citations [1], [2], etc. for every factual claim
- Write at a language level appropriate for the specified grade
- Structure the response with clear sections and key takeaways
- Include practical "teacher notes" about how to use these resources
- Generate proper APA citations for all references
""",
    }

    return base + agent_roles.get(agent, "")


# ---------------------------------------------------------------------------
# Phase 1: HyDE Query Expansion + ERIC retrieval + Trust-tier tagging
# ---------------------------------------------------------------------------

async def phase1_search(state: PipelineState) -> None:
    """
    Step 1: HyDE expansion + original ERIC search run IN PARALLEL.
    Step 2: If HyDE gave expanded queries, search ERIC with them too.
    Step 3: Deduplicate by ERIC id, apply trust tier, sort GOLD→SILVER→BRONZE, keep top 6.
    """
    # ── Step 1: HyDE + original ERIC search IN PARALLEL ──────────────────────
    system = _build_system_prompt("hyde", state)
    user_msg = f"""A teacher is searching for resources to teach {state.grade_level} students.

Their search query: "{state.query}"

Respond in JSON with exactly:
{{
    "expanded_queries": ["3 refined search queries — different angles, no overlap"],
    "detected_subject": "The primary subject area (e.g. Geography, Science, History)"
}}"""

    async def run_hyde():
        try:
            result = await chat_json(
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg},
                ],
                stage=state.stage,
                subject=state.subject,
                temperature=0.3,
                max_tokens=512,
            )
            state.expanded_queries = result.get("expanded_queries", [])
            state.detected_subject = result.get("detected_subject", state.subject or "")
            logger.info("HyDE: %d expanded queries, subject=%s", len(state.expanded_queries), state.detected_subject)
        except Exception as e:
            logger.warning("HyDE failed: %s — using original query only", e)
            state.expanded_queries = []
            state.detected_subject = state.subject or ""

    # Run HyDE and original-query ERIC search in parallel
    original_eric_task = fetch_eric_sources(state.query, rows=10, grade_level=state.grade_level)
    hyde_task = run_hyde()
    original_batch, _ = await asyncio.gather(original_eric_task, hyde_task, return_exceptions=True)

    # ── Step 2: ERIC expanded queries (if HyDE gave any) ─────────────────────
    batches = [original_batch] if isinstance(original_batch, list) else []
    if state.expanded_queries:
        extra_tasks = [
            fetch_eric_sources(q, rows=6, grade_level=state.grade_level)
            for q in state.expanded_queries[:2]
        ]
        extra_batches = await asyncio.gather(*extra_tasks, return_exceptions=True)
        batches.extend(b for b in extra_batches if isinstance(b, list))

    # ── Step 3: Dedup by ERIC id, apply trust tier, sort ────────────────────
    seen_eric_ids: set[str] = set()
    all_sources: list[dict] = []

    for batch in batches:
        if isinstance(batch, list):
            for src in batch:
                eric_id = src.get("eric_id", src["id"])
                if eric_id not in seen_eric_ids:
                    seen_eric_ids.add(eric_id)
                    # Remove internal dedup key before storing
                    src.pop("eric_id", None)
                    all_sources.append(src)

    # Sort: GOLD → SILVER → BRONZE, then by relevance_score desc
    all_sources.sort(key=lambda s: (
        _TIER_ORDER.get(s.get("trust_tier", "bronze"), 2),
        -s.get("relevance_score", 0),
    ))

    state.rag_sources = all_sources[:settings.rerank_top_k]
    logger.info("Phase 1 complete: %d sources (from %d raw)", len(state.rag_sources), len(all_sources))


# ---------------------------------------------------------------------------
# Phase 2: Dual-Agent Evaluation (parallel)
# ---------------------------------------------------------------------------

def _format_sources_for_review(sources: list[dict]) -> str:
    lines = []
    for i, s in enumerate(sources, 1):
        lines.append(
            f"[Source {i}] {s['title']}\n"
            f"Provider: {s['provider']} | Trust Tier: {s.get('trust_tier', 'unknown')}\n"
            f"URL: {s['url']}\n"
            f"Snippet: {s['snippet']}\n"
        )
    return "\n".join(lines)


async def _run_bad_cop(state: PipelineState) -> dict:
    system = _build_system_prompt("bad_cop", state)
    sources_text = _format_sources_for_review(state.rag_sources)
    user_msg = f"""Review these {len(state.rag_sources)} sources for the query: "{state.query}"

{sources_text}

Evaluate each source against:
1. TRUSTWORTHINESS — is the provider credible?
2. ACCURACY — is content factually sound?
3. AGE SAFETY — appropriate for {state.grade_level}?
4. CULTURAL RESPECT — First Nations and diverse perspectives?
5. CURRICULUM FIT — aligned to ACARA/NZQA standards?
6. VISUAL SAFETY RISK — is there risk of unsafe imagery?

Respond in JSON:
{{
    "rating": <1-10 float>,
    "verdict": "approve" | "flag" | "reject",
    "sources_to_remove": [<1-based source numbers to remove>],
    "concerns": ["specific concern 1", "specific concern 2"],
    "visual_risk_flags": ["source N: reason"],
    "summary": "2-3 sentence critical assessment"
}}"""

    try:
        return await chat_json(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg},
            ],
            stage=state.stage,
            subject=state.detected_subject or state.subject,
            temperature=0.2,
            max_tokens=1024,
        )
    except Exception as e:
        logger.warning("Bad Cop failed: %s", e)
        return {
            "rating": 7.5,  # neutral — don't trigger retry on timeout
            "verdict": "flag",
            "sources_to_remove": [],
            "concerns": ["Automated safety review unavailable — teacher review recommended"],
            "visual_risk_flags": [],
            "summary": "Bad Cop review could not be completed. Teacher review recommended.",
        }


async def _run_good_cop(state: PipelineState) -> dict:
    system = _build_system_prompt("good_cop", state)
    sources_text = _format_sources_for_review(state.rag_sources)
    user_msg = f"""Review these {len(state.rag_sources)} sources for the query: "{state.query}"

{sources_text}

Evaluate each source for:
1. CURRICULUM ALIGNMENT — matches ACARA/NZQA standards?
2. PEDAGOGICAL VALUE — clear learning outcomes?
3. DIVERSE PERSPECTIVES — First Nations, multicultural, inclusive?
4. PRACTICAL USEFULNESS — teacher can use immediately?
5. ENGAGEMENT — appropriate for {state.grade_level} students?

Respond in JSON:
{{
    "rating": <1-10 float>,
    "verdict": "approve" | "conditional",
    "best_sources": [<1-based source numbers, ranked best first>],
    "positive_points": ["specific strength 1", "specific strength 2"],
    "summary": "2-3 sentence summary of what makes these sources valuable"
}}"""

    try:
        return await chat_json(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg},
            ],
            stage=state.stage,
            subject=state.detected_subject or state.subject,
            temperature=0.2,
            max_tokens=1024,
        )
    except Exception as e:
        logger.warning("Good Cop failed: %s", e)
        return {
            "rating": 7.5,  # neutral — don't trigger retry on timeout
            "verdict": "conditional",
            "best_sources": list(range(1, len(state.rag_sources) + 1)),
            "positive_points": ["Sources retrieved from known providers"],
            "summary": "Good Cop review could not be completed.",
        }


async def phase2_evaluate(state: PipelineState) -> None:
    """Run Bad Cop and Good Cop in parallel, apply removals."""
    if not state.rag_sources:
        logger.warning("Phase 2 skipped — no sources to evaluate")
        return

    bad_cop, good_cop = await asyncio.gather(
        _run_bad_cop(state),
        _run_good_cop(state),
    )

    state.bad_cop_result = bad_cop
    state.good_cop_result = good_cop

    # Apply Bad Cop removals (1-based indices)
    to_remove = set(bad_cop.get("sources_to_remove", []))
    if to_remove and len(state.rag_sources) > len(to_remove):
        # Never leave zero sources
        state.rag_sources = [s for i, s in enumerate(state.rag_sources, 1) if i not in to_remove]
        logger.info("Removed %d sources flagged by Bad Cop", len(to_remove))

    logger.info(
        "Phase 2 complete: Bad Cop=%.1f, Good Cop=%.1f",
        bad_cop.get("rating", 0),
        good_cop.get("rating", 0),
    )


# ---------------------------------------------------------------------------
# Phase 3: Citation-Grounded Synthesis
# ---------------------------------------------------------------------------

async def phase3_synthesize(state: PipelineState) -> None:
    system = _build_system_prompt("synthesizer", state)

    sources_text = ""
    for i, s in enumerate(state.rag_sources, 1):
        author_str = s.get("author", "Unknown")
        sources_text += (
            f"[{i}] {s['title']}\n"
            f"Authors: {author_str}\n"
            f"Source: {s['provider']} ({s.get('trust_tier', 'unknown').upper()} tier)\n"
            f"URL: {s['url']}\n"
            f"Content: {s['snippet']}\n\n"
        )

    user_msg = f"""These {len(state.rag_sources)} sources have passed dual-agent review for: "{state.query}"

{sources_text}

Create a comprehensive, classroom-ready synthesis:
1. Synthesise key findings across ALL sources
2. Use inline citations [1], [2], etc. for EVERY factual claim
3. Structure with clear sections and key takeaways
4. Identify cross-source themes and connections
5. Note any gaps or areas needing teacher scaffolding

Respond in JSON:
{{
    "summary": "Comprehensive summary with inline citations [1], [2]...",
    "key_themes": ["theme 1", "theme 2"],
    "teacher_notes": "Practical notes for the teacher...",
    "references": [
        {{
            "index": 1,
            "title": "Source title",
            "authors": ["Author 1"],
            "url": "source url",
            "publish_date": "YYYY",
            "source": "Provider name",
            "citation_apa": "Full APA 7th edition citation string"
        }}
    ]
}}"""

    try:
        result = await chat_json(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg},
            ],
            stage=state.stage,
            subject=state.detected_subject or state.subject,
            temperature=0.3,
            max_tokens=2000,
        )
        state.synthesis = result
        logger.info("Phase 3 complete: synthesis generated")
    except Exception as e:
        logger.warning("Synthesis failed: %s", e)
        state.synthesis = None


# ---------------------------------------------------------------------------
# Full pipeline orchestrator
# ---------------------------------------------------------------------------

async def run_pipeline(
    query: str,
    grade_level: str = "middle",
    subject: Optional[str] = None,
    user_role: str = "teacher",
    classroom_context: Optional[dict] = None,
) -> Optional[dict]:
    """
    Run the full 4-call search pipeline.
    Returns SearchPipelineResult dict (with rag_sources) or None if unavailable.
    """
    if not is_available():
        logger.info("CurricuLLM not configured — pipeline skipped")
        return None

    start = time.time()
    state = PipelineState(
        query=query,
        grade_level=grade_level,
        subject=subject,
        user_role=user_role,
        classroom_context=classroom_context,
    )

    # ── Phase 1: HyDE + ERIC retrieval + Trust-tier tagging ──────────────────
    await phase1_search(state)

    if not state.rag_sources:
        logger.warning("Pipeline produced no sources — ERIC may be unreachable")
        return None

    # ── Phase 2: Dual-agent evaluation (parallel) ─────────────────────────────
    await phase2_evaluate(state)

    bad_rating = state.bad_cop_result.get("rating", 5.0) if state.bad_cop_result else 5.0
    good_rating = state.good_cop_result.get("rating", 5.0) if state.good_cop_result else 5.0
    consensus = (bad_rating + good_rating) / 2

    # ── Conditional retry ─────────────────────────────────────────────────────
    if consensus < settings.consensus_threshold and state.retry_count < settings.max_pipeline_retries:
        logger.info(
            "Consensus %.1f < %.1f — retrying (attempt %d)",
            consensus, settings.consensus_threshold, state.retry_count + 1
        )
        concerns = state.bad_cop_result.get("concerns", []) if state.bad_cop_result else []
        concern_text = "; ".join(concerns[:3]) if concerns else "low quality"
        state.query = f"{query} (excluding: {concern_text})"
        state.rag_sources = []
        state.retry_count += 1

        await phase1_search(state)
        if state.rag_sources:
            await phase2_evaluate(state)
            bad_rating = state.bad_cop_result.get("rating", 5.0) if state.bad_cop_result else 5.0
            good_rating = state.good_cop_result.get("rating", 5.0) if state.good_cop_result else 5.0
            consensus = (bad_rating + good_rating) / 2

    # ── Phase 3: Synthesis ───────────────────────────────────────────────────
    await phase3_synthesize(state)

    total_time = time.time() - start

    # ── Build removed_sources as [{id, title, reason}] ───────────────────────
    removed_nums = set(state.bad_cop_result.get("sources_to_remove", [])) if state.bad_cop_result else set()
    removed_sources = []
    # We need original list before removal — reconstruct from concerns
    concerns_text = "; ".join(state.bad_cop_result.get("concerns", [])) if state.bad_cop_result else ""
    for num in sorted(removed_nums):
        # num is 1-based index into original rag_sources list before removal
        # We can only give the reason from the Bad Cop concerns summary
        removed_sources.append({
            "id": f"removed-{num}",
            "title": f"Source {num}",
            "reason": concerns_text[:120] if concerns_text else "Flagged by safety review",
        })

    # ── Build references ──────────────────────────────────────────────────────
    if state.synthesis and state.synthesis.get("references"):
        references = [
            ref.get("citation_apa", f"{ref.get('title', '')}. {ref.get('source', '')}. {ref.get('url', '')}")
            for ref in state.synthesis["references"]
        ]
    else:
        references = [
            f"{s.get('author', '')}{'.' if s.get('author') else ''} "
            f"({str(s.get('publish_date', '2024'))[:4]}). {s['title']}. {s['provider']}. {s['url']}"
            for s in state.rag_sources
        ]

    summary = ""
    if state.synthesis:
        summary = state.synthesis.get("summary", "")
        teacher_notes = state.synthesis.get("teacher_notes", "")
        if teacher_notes:
            summary += f"\n\nTeacher Notes: {teacher_notes}"
    else:
        summary = f'Found {len(state.rag_sources)} resources for "{query}" at {state.stage} level.'

    return {
        "query": query,
        "expanded_queries": state.expanded_queries,
        "grade_level": grade_level,
        "subject": state.detected_subject or subject or "",
        "stage": "complete",
        "rag_sources": state.rag_sources,
        "dual_agent_review": {
            "good_cop": {
                "rating": good_rating,
                "verdict": state.good_cop_result.get("verdict", "conditional") if state.good_cop_result else "conditional",
                "points": state.good_cop_result.get("positive_points", []) if state.good_cop_result else [],
                "concerns": [],
                "summary": state.good_cop_result.get("summary", "") if state.good_cop_result else "",
            },
            "bad_cop": {
                "rating": bad_rating,
                "verdict": state.bad_cop_result.get("verdict", "flag") if state.bad_cop_result else "flag",
                "points": [],
                "concerns": state.bad_cop_result.get("concerns", []) if state.bad_cop_result else [],
                "summary": state.bad_cop_result.get("summary", "") if state.bad_cop_result else "",
            },
            "consensus_score": round(consensus, 1),
            "consensus_verdict": (
                (state.bad_cop_result.get("summary", "") if state.bad_cop_result else "") + " " +
                (state.good_cop_result.get("summary", "") if state.good_cop_result else "")
            ).strip(),
            "recommendation": state.bad_cop_result.get("verdict", "review") if state.bad_cop_result else "review",
            "removed_sources": removed_sources,
        },
        "summary": summary,
        "references": references,
        "removed_sources": removed_sources,
        "total_time": round(total_time, 2),
        "retry_count": state.retry_count,
        "error": None,
    }
