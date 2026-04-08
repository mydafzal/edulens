"""
CurricuLLM API Client — The sole LLM provider for EduLens.

Uses the OpenAI-compatible SDK with CurricuLLM's base_url.
Key feature: `curriculum` parameter with `stage` and `subject`
for education-aware responses.
"""

from openai import AsyncOpenAI
from typing import Optional
from app.core.config import settings


def get_client() -> AsyncOpenAI:
    """Create an AsyncOpenAI client pointed at CurricuLLM."""
    return AsyncOpenAI(
        api_key=settings.curricullm_api_key,
        base_url=f"{settings.curricullm_base_url}/v1",
    )


# Singleton client
client = get_client()


# ── Grade-level mapping for CurricuLLM's `curriculum.stage` parameter ──
GRADE_TO_STAGE = {
    "early-years": "Foundation to Year 2",
    "primary": "Years 3 to 6",
    "middle": "Years 7 to 9",
    "senior": "Years 10 to 12",
    "tertiary": "Tertiary",
}


async def chat(
    messages: list[dict],
    stage: Optional[str] = None,
    subject: Optional[str] = None,
    response_format: Optional[dict] = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
    stream: bool = False,
):
    """
    Single entry point for all CurricuLLM API calls.

    Args:
        messages: Chat messages (system, user, assistant, tool)
        stage: Grade level string (maps from Teaching To selector)
        subject: Subject area for curriculum context
        response_format: {"type": "json_object"} for structured output
        temperature: 0-2, lower = more focused
        max_tokens: Max response tokens
        stream: Whether to stream the response

    Returns:
        ChatCompletion response or async stream
    """
    # Build request kwargs
    kwargs: dict = {
        "model": settings.curricullm_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream,
    }

    # Add curriculum context — this is CurricuLLM's unique feature
    curriculum_ctx = {}
    if stage:
        curriculum_ctx["stage"] = GRADE_TO_STAGE.get(stage, stage)
    if subject:
        curriculum_ctx["subject"] = subject
    if curriculum_ctx:
        kwargs["curriculum"] = curriculum_ctx

    # Add structured output format
    if response_format:
        kwargs["response_format"] = response_format

    return await client.chat.completions.create(**kwargs)


async def chat_json(
    messages: list[dict],
    stage: Optional[str] = None,
    subject: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: int = 2048,
) -> dict:
    """
    Convenience method that forces JSON output and parses the response.
    Used by evaluation agents for structured scoring.
    """
    import json

    response = await chat(
        messages=messages,
        stage=stage,
        subject=subject,
        response_format={"type": "json_object"},
        temperature=temperature,
        max_tokens=max_tokens,
        stream=False,
    )

    content = response.choices[0].message.content
    return json.loads(content)
