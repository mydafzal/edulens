# CurricuLLM API Calls — Complete Reference

> Every LLM call in EduLens goes through CurricuLLM. No other LLM provider is used.
> All calls use the OpenAI-compatible SDK with CurricuLLM's `base_url` and unique `curriculum` parameter.

---

## Client Setup

**File:** `backend/app/services/curricullm.py`

```python
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=settings.curricullm_api_key,              # JWT token from console.curricullm.com
    base_url=f"{settings.curricullm_base_url}/v1",     # https://api.curricullm.com/v1
)
```

**Model:** `CurricuLLM-AU` (Australian curriculum-aware model)

**Unique Feature — `curriculum` parameter:**
```python
kwargs["curriculum"] = {
    "stage": "Years 7 to 9",     # Mapped from grade level
    "subject": "Geography"        # Optional subject filter
}
```

**Grade-to-Stage Mapping:**
| Grade Level ID | CurricuLLM `stage` Value |
|---------------|-------------------------|
| `early-years` | `Foundation to Year 2` |
| `primary` | `Years 3 to 6` |
| `middle` | `Years 7 to 9` |
| `senior` | `Years 10 to 12` |
| `tertiary` | `Tertiary` |

---

## Two Entry Points

### 1. `chat()` — General-purpose call
```python
async def chat(messages, stage, subject, response_format, temperature, max_tokens, stream):
```
- Used for: tool execution, streaming responses
- Returns: `ChatCompletion` response or async stream

### 2. `chat_json()` — Structured JSON output
```python
async def chat_json(messages, stage, subject, temperature, max_tokens) -> dict:
```
- Wraps `chat()` with `response_format={"type": "json_object"}`
- Auto-parses JSON response
- Used for: all pipeline calls (HyDE, Bad Cop, Good Cop, Synthesizer)

---

## Pipeline API Calls (4 total per search, 2 run in parallel)

### CALL 1 — HyDE Query Expansion (Phase 1: Search)

**File:** `backend/app/services/pipeline.py` → `phase1_search()`

| Parameter | Value |
|-----------|-------|
| **Method** | `chat_json()` |
| **Temperature** | `0.3` |
| **Max Tokens** | `2048` (default) |
| **System Prompt Agent** | `"hyde"` |
| **When** | First call in the pipeline |

**System Prompt (via `_build_system_prompt("hyde", state)`):**
```
You are part of EduLens, an AI-powered educational resource discovery platform...

USER CONTEXT:
- Role: teacher — a classroom teacher who needs curriculum-aligned, ready-to-use resources...
- Teaching to: middle students
- Grade requirements: Years 7 to 9 (ages 12-15). Students are developing critical thinking...
- Subject: Geography
- Search query: "Water scarcity Year 9 Geography Queensland"

CLASSROOM LOCALISATION CONTEXT:
- Location: Mildura Senior College, Mildura, Victoria, Australia
- First Nations context: Latji Latji Country
- Local landmarks & geography: Murray River, Hattah-Kulkyne National Park
- Student interests: AFL, TikTok, Gaming
[... all 13 fields if set ...]

YOUR ROLE: Query Expansion & HyDE Agent
You analyse the educator's search intent and expand it into multiple angles...
Think about:
- What curriculum codes or standards relate to this query?
- What vocabulary would high-quality educational resources use?
- What subtopics would a thorough resource cover?
- What pedagogical approaches suit this grade level?
```

**User Prompt:**
```
You are an educational resource discovery assistant. A teacher is searching for
resources to teach middle students.

Their search query: "Water scarcity Year 9 Geography Queensland"

Respond in JSON with:
{
    "expanded_queries": ["3-4 refined search queries..."],
    "hyde_document": "Write a 100-word hypothetical ideal educational resource abstract...",
    "detected_subject": "The primary subject area"
}
```

**Expected JSON Response:**
```json
{
    "expanded_queries": [
        "Water scarcity Year 9 Geography Queensland",
        "water management environmental education Australia secondary",
        "Murray-Darling Basin teaching materials Year 9 Geography",
        "drought climate change curriculum-aligned resources ACARA"
    ],
    "hyde_document": "This peer-reviewed resource examines water scarcity...",
    "detected_subject": "Geography"
}
```

---

### CALL 2 — Bad Cop Evaluation (Phase 2: Evaluate — runs in PARALLEL with Call 3)

**File:** `backend/app/services/pipeline.py` → `_run_bad_cop()`

| Parameter | Value |
|-----------|-------|
| **Method** | `chat_json()` |
| **Temperature** | `0.2` |
| **Max Tokens** | `2048` (default) |
| **System Prompt Agent** | `"bad_cop"` |
| **When** | After Phase 1 retrieves sources, runs in `asyncio.gather()` with Good Cop |

**System Prompt (via `_build_system_prompt("bad_cop", state)`):**
```
[... base context same as above ...]

YOUR ROLE: Bad Cop — Critical Content Safety Reviewer
You are the SKEPTIC. Your mandate is to PROTECT middle students from:
- Unreliable, outdated, or factually incorrect content
- Age-inappropriate material (violence, complex trauma, sexual content, substance references)
- Culturally insensitive or biased perspectives
- Sources with poor provenance or unknown authorship
- Content that doesn't align with middle cognitive and emotional development

VISUAL & MEDIA SAFETY (IMPORTANT):
You cannot see images directly, but you MUST assess the RISK of unsafe visual content based on:
- Source type: Is this from an ad-supported website, blog, or social media? ...
- Provider reputation: Government (.gov.au), peer-reviewed journals ... LOW risk. Unknown blogs ... HIGH risk.
- Content topic sensitivity: Topics involving war, colonisation, health/anatomy ...
- URL patterns: Sites with excessive subdomains, tracking parameters ...
- Age-specific visual concerns for middle:
  * Middle School: Contextual images okay if educational, but flag graphic/confronting visuals

LOCATION & CULTURE-SPECIFIC VISUAL CONCERNS:
- First Nations context: Latji Latji Country. Sacred/ceremonial imagery may require permissions...
- Students from Vietnamese, Mandarin backgrounds — be aware of culturally specific visual taboos...
- Location: Mildura, Victoria — flag any imagery that misrepresents or stereotypes this region...

When flagging for removal, explicitly note if the concern is VISUAL SAFETY vs TEXT CONTENT...
You must be STRICT. If a source is borderline, flag it for removal.
```

**User Prompt:**
```
Review these 6 sources retrieved for the query: "Water scarcity Year 9 Geography Queensland"

[Source 1] Water Scarcity and Management in the Murray-Darling Basin
Provider: ERIC | Trust Tier: gold
URL: https://eric.ed.gov/?id=EJ1234567
Snippet: This peer-reviewed study examines...

[Source 2] Climate Change Impacts on Australian Water Systems
Provider: OER Commons | Trust Tier: gold
URL: https://www.oercommons.org/courses/climate-water-aus
Snippet: ...

[... all sources ...]

For each source, evaluate against these criteria:
1. TRUSTWORTHINESS
2. ACCURACY
3. AGE SAFETY
4. CULTURAL RESPECT
5. CURRICULUM FIT
6. VISUAL SAFETY RISK

Respond in JSON:
{
    "rating": <1-10>,
    "verdict": "approve" or "flag" or "reject",
    "sources_to_remove": [<source numbers to remove>],
    "concerns": ["specific concern 1...", ...],
    "visual_risk_flags": ["source X: HIGH risk — ad-supported commercial site", ...],
    "summary": "2-3 sentence critical assessment"
}
```

**Expected JSON Response:**
```json
{
    "rating": 7.8,
    "verdict": "approve",
    "sources_to_remove": [],
    "concerns": [
        "CSIRO case study (source #5) has a slight pro-agriculture bias",
        "BOM data (source #4) requires teacher scaffolding for Year 9 students",
        "ABC Education video (source #6) published 2023 — verify statistics are current"
    ],
    "visual_risk_flags": [],
    "summary": "Sources are legitimate and trustworthy. Minor concerns around..."
}
```

---

### CALL 3 — Good Cop Evaluation (Phase 2: Evaluate — runs in PARALLEL with Call 2)

**File:** `backend/app/services/pipeline.py` → `_run_good_cop()`

| Parameter | Value |
|-----------|-------|
| **Method** | `chat_json()` |
| **Temperature** | `0.2` |
| **Max Tokens** | `2048` (default) |
| **System Prompt Agent** | `"good_cop"` |
| **When** | Runs simultaneously with Bad Cop via `asyncio.gather()` |

**System Prompt (via `_build_system_prompt("good_cop", state)`):**
```
[... base context same as above ...]

YOUR ROLE: Good Cop — Constructive Quality Validator
You are the ADVOCATE for high-quality education. Your mandate is to identify:
- Sources with strong curriculum alignment (ACARA / NZQA standards)
- Pedagogically sound content with clear learning outcomes
- Diverse perspectives including First Nations, multicultural, and inclusive voices
- Content that matches the cognitive level of middle students
- Resources that a classroom teacher can immediately put to use

You should be SUPPORTIVE but honest. Highlight what makes each source valuable...
Rank sources by their practical usefulness for this specific educator and grade level.
```

**User Prompt:**
```
Review these 6 sources retrieved for the query: "Water scarcity Year 9 Geography Queensland"

[Source 1] Water Scarcity and Management in the Murray-Darling Basin
Provider: ERIC | Trust Tier: gold
...

For each source, evaluate these strengths:
1. CURRICULUM ALIGNMENT
2. PEDAGOGICAL VALUE
3. DIVERSE PERSPECTIVES
4. PRACTICAL USEFULNESS
5. ENGAGEMENT

Respond in JSON:
{
    "rating": <1-10>,
    "verdict": "approve" or "conditional",
    "best_sources": [<source numbers ranked by quality>],
    "positive_points": ["specific strength 1...", ...],
    "summary": "2-3 sentence summary of what makes these sources valuable..."
}
```

**Expected JSON Response:**
```json
{
    "rating": 9.2,
    "verdict": "approve",
    "best_sources": [1, 3, 2, 4, 5, 6],
    "positive_points": [
        "All 6 sources are from Tier 1 verified providers",
        "Strong curriculum alignment with ACARA Geography and Science",
        "First Nations perspectives represented through AIATSIS-verified content",
        "Mix of content types supports diverse learning styles",
        "All resources have clear licensing"
    ],
    "summary": "Excellent resource set. All sources verified, curriculum-aligned..."
}
```

---

### CALL 4 — Citation-Grounded Synthesis (Phase 3: Synthesize)

**File:** `backend/app/services/pipeline.py` → `phase3_synthesize()`

| Parameter | Value |
|-----------|-------|
| **Method** | `chat_json()` |
| **Temperature** | `0.3` |
| **Max Tokens** | `3000` |
| **System Prompt Agent** | `"synthesizer"` |
| **When** | After dual-agent evaluation completes and sources are filtered |

**System Prompt (via `_build_system_prompt("synthesizer", state)`):**
```
[... base context same as above ...]

YOUR ROLE: Citation-Grounded Synthesis Agent
You create comprehensive, classroom-ready summaries from verified educational sources.
Your output will be read by a classroom teacher.

STRICT RULES:
- ONLY reference information present in the provided sources — never hallucinate
- Use inline citations [1], [2], etc. for every factual claim
- Write at a language level appropriate for middle students
- Structure the response with clear sections and key takeaways
- Include practical "teacher notes" about how to use these resources
- Generate proper APA citations for all references
```

**User Prompt:**
```
These 6 sources have passed dual-agent authenticity review for the query:
"Water scarcity Year 9 Geography Queensland"

[1] Water Scarcity and Management in the Murray-Darling Basin
Authors: Mitchell, S., Thompson, R.
Source: ERIC (GOLD tier)
URL: https://eric.ed.gov/?id=EJ1234567
Content: This peer-reviewed study examines...

[2] Climate Change Impacts on Australian Water Systems
Authors: OER Commons Contributors
Source: OER Commons (GOLD tier)
...

Create a comprehensive, classroom-ready synthesis that:
1. Synthesizes key findings across ALL sources
2. Uses inline citations [1], [2], etc. for EVERY factual claim
3. Structures the response with clear sections and key takeaways
4. Identifies cross-source themes and connections
5. Notes any gaps

Respond in JSON:
{
    "summary": "Comprehensive summary with inline citations [1], [2]...",
    "key_themes": ["theme 1", "theme 2", ...],
    "teacher_notes": "Practical notes for the teacher...",
    "references": [
        {
            "index": 1,
            "title": "Source title",
            "authors": ["Author 1"],
            "url": "source url",
            "publish_date": "date",
            "source": "Provider name",
            "citation_apa": "Full APA 7th edition citation string"
        }
    ]
}
```

**Expected JSON Response:**
```json
{
    "summary": "Found 6 high-quality, verified resources on water scarcity for Year 9 Geography. All sources come from Tier 1 trusted providers [1][2][3][4][5][6]. The resource set covers multiple perspectives including scientific data [1], First Nations water knowledge [3], agricultural sustainability [5], and climate impacts [2]...",
    "key_themes": [
        "Environmental science of water scarcity in the Murray-Darling Basin",
        "First Nations perspectives on water management",
        "Climate data analysis and visualization",
        "Sustainable agriculture in regional Australia"
    ],
    "teacher_notes": "Use Source [4] BOM data with guided worksheets for Year 9 students...",
    "references": [
        {
            "index": 1,
            "title": "Water Scarcity and Management in the Murray-Darling Basin",
            "authors": ["Mitchell, S.", "Thompson, R."],
            "url": "https://eric.ed.gov/?id=EJ1234567",
            "publish_date": "2024-08-15",
            "source": "ERIC",
            "citation_apa": "Mitchell, S., & Thompson, R. (2024). Water scarcity and management in the Murray-Darling Basin. Journal of Environmental Education, 55(3), 142-158."
        }
    ]
}
```

---

## Standalone API Calls (outside the pipeline)

### CALL 5 — URL Evaluation (Standalone Endpoint)

**File:** `backend/app/api/routes.py` → `POST /api/v1/evaluate`

| Parameter | Value |
|-----------|-------|
| **Method** | `chat_json()` |
| **Temperature** | `0.2` |
| **Max Tokens** | `2048` (default) |
| **When** | User submits a single URL for quality assessment |

**System Prompt:**
```
You are an educational content quality assessor. Evaluate the given URL for classroom use. Respond in JSON.
```

**User Prompt:**
```
Evaluate this educational resource URL: https://example.com/resource
Target audience: middle students
Subject: Geography

Assess and respond in JSON:
{
    "accuracy": {"score": <0-100>, "rationale": "..."},
    "bias": {"score": <0-100>, "rationale": "..."},
    "age_appropriateness": {"score": <0-100>, "rationale": "..."},
    "cultural_sensitivity": {"score": <0-100>, "rationale": "..."},
    "safety": {"score": <0-100>, "rationale": "..."},
    "overall_score": <0-100>,
    "recommendation": "approve" or "caution" or "reject",
    "summary": "2-3 sentence evaluation summary"
}
```

---

### CALL 6 — Tool Execution (Standalone Endpoint)

**File:** `backend/app/api/routes.py` → `POST /api/v1/tools/execute`

| Parameter | Value |
|-----------|-------|
| **Method** | `chat()` (NOT `chat_json` — returns freeform text) |
| **Temperature** | `0.4` |
| **Max Tokens** | `3000` |
| **When** | User selects a tool (Lesson Plan, Quiz, etc.) to process search results |

**8 Built-in Tool System Prompts:**

| Tool ID | System Prompt |
|---------|--------------|
| `lesson-plan` | Create a detailed, standards-aligned lesson plan from these resources. Include objectives, activities, assessment, and differentiation strategies. |
| `worksheet` | Create an educational worksheet with varied question types (MCQ, short answer, extended response) based on these resources. |
| `quiz` | Create a formative assessment quiz with 10 questions at varied difficulty levels. |
| `text-rewriter` | Rewrite and simplify this content for the target grade level while maintaining accuracy. |
| `rubric` | Create a detailed assessment rubric with clear criteria and performance levels. |
| `writing-feedback` | Provide constructive, actionable feedback on this student writing. |
| `presentation` | Create a slide deck outline (10-12 slides) with key points, discussion questions, and visual suggestions. |
| `text-summarizer` | Summarize this content concisely while preserving key educational concepts. |

**User Prompt (for all tools):**
```
Tool: Lesson Plan Generator
Grade Level: middle
Subject: Geography

Input Content:
[search results / sources text]

Additional Instructions: [custom_instructions if provided]
```

---

## Retry Call (Conditional — only if consensus < 7.0)

### CALL 7 — Refined Search (Phase 1 retry)

**File:** `backend/app/services/pipeline.py` → `refine_and_retry()`

Same as Call 1 (HyDE), but the query is modified:
```python
state.query = f"{state.query} (excluding: {concern_text})"
# e.g., "Water scarcity Year 9 Geography (excluding: pro-agriculture bias; outdated stats; needs scaffolding)"
```

Then Phase 2 (Calls 2 & 3) re-runs on the new sources.

**Max retry: 1 time. So worst case = 7 CurricuLLM calls total (4 + 3).**

---

## Call Flow Summary

```
Normal flow (4 calls, ~3-5 seconds):

Phase 1 ─── [Call 1: HyDE] ──────────────────────── ~1.5s
                │
Phase 2 ───┬── [Call 2: Bad Cop] ─┐
           └── [Call 3: Good Cop] ─┤ PARALLEL ─── ~2.0s
                                   │
           Consensus = avg(ratings) ──> if >= 7.0 continue
                │
Phase 3 ─── [Call 4: Synthesize] ─────────────── ~1.5s


Retry flow (7 calls, ~6-9 seconds):

Phase 1 ─── [Call 1: HyDE] ─── ~1.5s
Phase 2 ─── [Call 2+3: Dual Agent] ─── ~2.0s
           Consensus < 7.0 → RETRY
Phase 1' ── [Call 1': Refined HyDE] ─── ~1.5s
Phase 2' ── [Call 2'+3': Dual Agent] ─── ~2.0s
Phase 3 ─── [Call 4: Synthesize] ─── ~1.5s
```

---

## Common Parameters Across All Calls

| Parameter | Pipeline Calls | Tool Execution | URL Evaluation |
|-----------|---------------|----------------|----------------|
| **Model** | `CurricuLLM-AU` | `CurricuLLM-AU` | `CurricuLLM-AU` |
| **Response Format** | `json_object` | None (freeform) | `json_object` |
| **Temperature** | 0.2 - 0.3 | 0.4 | 0.2 |
| **Max Tokens** | 2048 (3000 for synth) | 3000 | 2048 |
| **Curriculum Param** | Yes (stage + subject) | Yes (stage + subject) | Yes (stage + subject) |
| **Streaming** | Not yet (ready for it) | Not yet | No |

---

## System Prompt Context Injection

Every pipeline call includes this context block (built by `_build_system_prompt()`):

```
USER CONTEXT:
- Role: {user_role} — {role_description}
- Teaching to: {grade_level} students
- Grade requirements: {grade_description with age ranges and content rules}
- Subject: {subject if set}
- Search query: "{query}"

CLASSROOM LOCALISATION CONTEXT:
- Location: {schoolName}, {town}, {state}, {country}
- First Nations context: {firstNationsContext[]}
- Local landmarks & geography: {localLandmarks[]}
- Local sports teams: {localSportsTeams[]}
- Local artists & music: {localArtistsMusic[]}
- Community projects: {communityProjects[]}
- Cultural figures & role models: {culturalFigures[]}
- Student interests: {studentInterests[]}
- Language backgrounds in class: {languageBackgrounds[]}
- Local data sources: {localDataSources[]}

IMPORTANT RULES:
- All responses MUST be age-appropriate for the specified grade level
- Prioritise Australian/NZ curriculum standards (ACARA, NZQA)
- Respect First Nations and Torres Strait Islander cultural protocols
- Always respond in valid JSON
```

This ensures CurricuLLM has full context about WHO is searching, WHO they're teaching, and WHERE they are — every single time.
