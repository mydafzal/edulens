"""
EduLens API Routes

Main endpoints:
    POST /search      → Full 3-phase pipeline (Search → Evaluate → Synthesize)
    POST /evaluate     → Standalone resource evaluation
    POST /localize     → Adapt resources for local context
    GET  /resources/:id → Get a specific resource
    GET  /health       → Health check
"""

import time
import uuid
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.services.pipeline import run_pipeline
from app.core.config import settings

router = APIRouter()


# ════════════════════════════════════════════
# Request / Response Models
# ════════════════════════════════════════════

class PipelineSearchRequest(BaseModel):
    """Request for the 3-phase search pipeline."""
    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    grade_level: str = Field(..., description="Teaching To selection: early-years, primary, middle, senior, tertiary")
    subject: Optional[str] = Field(None, description="Optional subject filter")
    user_role: str = Field("teacher", description="User role for personalization")

    class Config:
        json_schema_extra = {
            "example": {
                "query": "Water scarcity Year 9 Geography Queensland",
                "grade_level": "middle",
                "subject": "Geography",
                "user_role": "teacher",
            }
        }


class RAGSourceResponse(BaseModel):
    id: str
    title: str
    url: str
    snippet: str
    trust_tier: str  # gold, silver, bronze
    relevance_score: float
    provider: str


class DualAgentCopResponse(BaseModel):
    verdict: str
    rating: float
    summary: str


class GoodCopResponse(DualAgentCopResponse):
    positive_points: List[str] = []


class BadCopResponse(DualAgentCopResponse):
    concerns: List[str] = []


class DualAgentReviewResponse(BaseModel):
    good_cop: GoodCopResponse
    bad_cop: BadCopResponse
    consensus_score: float


class ReferenceResponse(BaseModel):
    index: Optional[int] = None
    title: str = ""
    authors: List[str] = []
    url: str = ""
    publish_date: str = ""
    source: str = ""
    citation_apa: str = ""


class RemovedSourceResponse(BaseModel):
    id: str
    title: str
    reason: str


class PipelineSearchResponse(BaseModel):
    """Full response from the 3-phase pipeline."""
    query: str
    expanded_queries: List[str] = []
    stage: str
    grade_level: str
    subject: Optional[str] = None
    rag_sources: List[RAGSourceResponse] = []
    dual_agent_review: DualAgentReviewResponse
    summary: str
    references: List[ReferenceResponse] = []
    removed_sources: List[RemovedSourceResponse] = []
    total_time: float
    retry_count: int = 0
    error: Optional[str] = None


# ════════════════════════════════════════════
# MAIN ENDPOINT: 3-Phase Pipeline Search
# ════════════════════════════════════════════

@router.post("/search", response_model=PipelineSearchResponse)
async def search_pipeline(request: PipelineSearchRequest):
    """
    Execute the full 3-phase search pipeline.

    Phase 1 — SEARCH:
        1 CurricuLLM call (query expansion + HyDE)
        + ERIC API retrieval (no LLM)
        + Rule-based trust-tier tagging (no LLM)

    Phase 2 — EVALUATE:
        2 CurricuLLM calls IN PARALLEL (Bad Cop + Good Cop)
        + Server-side consensus scoring (no LLM)
        + Conditional retry if consensus < threshold

    Phase 3 — SYNTHESIZE:
        1 CurricuLLM call (citation-grounded summary)

    Total: 4 CurricuLLM API calls (2 run in parallel)
    Expected latency: 3-5 seconds
    """
    result = await run_pipeline(
        query=request.query,
        grade_level=request.grade_level,
        subject=request.subject,
        user_role=request.user_role,
    )

    return PipelineSearchResponse(**result)


# ════════════════════════════════════════════
# STANDALONE EVALUATE ENDPOINT
# ════════════════════════════════════════════

class EvaluateURLRequest(BaseModel):
    """Evaluate a single URL for educational quality."""
    url: str
    grade_level: str = "middle"
    subject: Optional[str] = None


class EvaluateURLResponse(BaseModel):
    url: str
    trust_tier: str
    evaluation: dict
    evaluation_time: float


@router.post("/evaluate")
async def evaluate_url(request: EvaluateURLRequest):
    """
    Evaluate a single URL for educational quality.
    Uses 1 CurricuLLM call for content assessment + rule-based trust tier.
    """
    from app.services.trust import classify_trust_tier
    from app.services import curricullm

    start_time = time.time()

    trust_tier = classify_trust_tier(url=request.url)

    try:
        evaluation = await curricullm.chat_json(
            messages=[
                {"role": "system", "content": "You are an educational content quality assessor. Evaluate the given URL for classroom use. Respond in JSON."},
                {"role": "user", "content": f"""Evaluate this educational resource URL: {request.url}
Target audience: {request.grade_level} students
Subject: {request.subject or "General"}

Assess and respond in JSON:
{{
    "accuracy": {{"score": <0-100>, "rationale": "..."}},
    "bias": {{"score": <0-100>, "rationale": "..."}},
    "age_appropriateness": {{"score": <0-100>, "rationale": "..."}},
    "cultural_sensitivity": {{"score": <0-100>, "rationale": "..."}},
    "safety": {{"score": <0-100>, "rationale": "..."}},
    "overall_score": <0-100>,
    "recommendation": "approve" or "caution" or "reject",
    "summary": "2-3 sentence evaluation summary"
}}"""},
            ],
            stage=request.grade_level,
            subject=request.subject,
            temperature=0.2,
        )
    except Exception as e:
        evaluation = {"error": str(e), "overall_score": 0, "recommendation": "caution"}

    return EvaluateURLResponse(
        url=request.url,
        trust_tier=trust_tier,
        evaluation=evaluation,
        evaluation_time=round(time.time() - start_time, 2),
    )


# ════════════════════════════════════════════
# TOOL EXECUTION ENDPOINT
# ════════════════════════════════════════════

class ToolExecuteRequest(BaseModel):
    """Execute a tool (Lesson Plan Generator, etc.) using search results."""
    tool_id: str
    tool_name: str
    input_text: str  # The raw search results / sources
    grade_level: str = "middle"
    subject: Optional[str] = None
    custom_instructions: Optional[str] = None


@router.post("/tools/execute")
async def execute_tool(request: ToolExecuteRequest):
    """
    Execute a tool using CurricuLLM.
    Takes search results and transforms them via the selected tool.

    Examples: Lesson Plan Generator, Worksheet Generator, Quiz Builder, etc.

    Uses 1 CurricuLLM call with curriculum context.
    """
    from app.services import curricullm

    tool_prompts = {
        "lesson-plan": "Create a detailed, standards-aligned lesson plan from these resources. Include objectives, activities, assessment, and differentiation strategies.",
        "worksheet": "Create an educational worksheet with varied question types (multiple choice, short answer, extended response) based on these resources.",
        "quiz": "Create a formative assessment quiz with 10 questions at varied difficulty levels based on these resources.",
        "text-rewriter": "Rewrite and simplify this content for the target grade level while maintaining accuracy.",
        "rubric": "Create a detailed assessment rubric with clear criteria and performance levels.",
        "writing-feedback": "Provide constructive, actionable feedback on this student writing.",
        "presentation": "Create a slide deck outline (10-12 slides) with key points, discussion questions, and visual suggestions.",
        "text-summarizer": "Summarize this content concisely while preserving key educational concepts.",
    }

    system_prompt = tool_prompts.get(
        request.tool_id,
        request.custom_instructions or "Process this educational content according to the user's request."
    )

    user_content = f"""Tool: {request.tool_name}
Grade Level: {request.grade_level}
Subject: {request.subject or "General"}

Input Content:
{request.input_text}

{f"Additional Instructions: {request.custom_instructions}" if request.custom_instructions else ""}"""

    try:
        response = await curricullm.chat(
            messages=[
                {"role": "system", "content": f"You are an expert educational tool. {system_prompt}"},
                {"role": "user", "content": user_content},
            ],
            stage=request.grade_level,
            subject=request.subject,
            temperature=0.4,
            max_tokens=3000,
        )

        return {
            "tool_id": request.tool_id,
            "tool_name": request.tool_name,
            "output": response.choices[0].message.content,
            "model": response.model,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                "total_tokens": response.usage.total_tokens if response.usage else 0,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")


# ════════════════════════════════════════════
# UTILITY ENDPOINTS
# ════════════════════════════════════════════

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "EduLens API",
        "pipeline": "3-phase (Search → Evaluate → Synthesize)",
        "llm_provider": "CurricuLLM",
        "model": settings.curricullm_model,
    }
