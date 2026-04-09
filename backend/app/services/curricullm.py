"""
CurricuLLM Client — OpenAI-compatible API for educational content generation.

Endpoint: POST https://api.curricullm.com/v1/chat/completions
Unique feature: `curriculum` parameter with `stage` and `subject`.
"""

import json
import logging
from typing import Optional

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger("edulens.curricullm")

# ---------------------------------------------------------------------------
# Grade-level → CurricuLLM stage mapping
# ---------------------------------------------------------------------------
GRADE_TO_STAGE = {
    "early": "Foundation to Year 2",
    "early-years": "Foundation to Year 2",
    "primary": "Years 3 to 6",
    "middle": "Years 7 to 9",
    "senior": "Years 10 to 12",
    "tertiary": "Tertiary",
}

# ---------------------------------------------------------------------------
# Grade-level descriptions for system prompts
# ---------------------------------------------------------------------------
GRADE_DESCRIPTIONS = {
    "early": "Foundation to Year 2 (ages 5-8). Students are early readers with concrete thinking.",
    "early-years": "Foundation to Year 2 (ages 5-8). Students are early readers with concrete thinking.",
    "primary": "Years 3 to 6 (ages 8-12). Students are developing literacy and basic reasoning skills.",
    "middle": "Years 7 to 9 (ages 12-15). Students are developing critical thinking and abstract reasoning.",
    "senior": "Years 10 to 12 (ages 15-18). Students are preparing for tertiary study or employment.",
    "tertiary": "Tertiary (ages 18+). Students are undertaking higher education.",
}

# ---------------------------------------------------------------------------
# Singleton client
# ---------------------------------------------------------------------------
_client: Optional[AsyncOpenAI] = None


def _get_client() -> Optional[AsyncOpenAI]:
    """Lazy-init the AI client. Prefers OpenAI key; falls back to CurricuLLM."""
    global _client
    if _client is not None:
        return _client

    if settings.openai_api_key:
        _client = AsyncOpenAI(
            api_key=settings.openai_api_key,
            timeout=30.0,
        )
        logger.info("AI client: OpenAI (gpt-4o-mini)")
    elif settings.curricullm_api_key:
        _client = AsyncOpenAI(
            api_key=settings.curricullm_api_key,
            base_url=f"{settings.curricullm_base_url}/v1",
            timeout=8.0,
        )
        logger.info("AI client: CurricuLLM (%s/v1)", settings.curricullm_base_url)
    return _client


def _get_model() -> str:
    """Return the model ID to use."""
    if settings.openai_api_key:
        return "gpt-4o-mini"
    return settings.curricullm_model


def is_available() -> bool:
    """Check whether any AI provider is configured."""
    return bool(settings.openai_api_key or settings.curricullm_api_key)


# ---------------------------------------------------------------------------
# Core call methods
# ---------------------------------------------------------------------------

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
    General-purpose CurricuLLM call.
    Returns ChatCompletion response or async stream.
    """
    client = _get_client()
    if client is None:
        raise RuntimeError("CurricuLLM API key not configured")

    kwargs = {
        "model": _get_model(),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream,
    }

    if response_format:
        kwargs["response_format"] = response_format

    # CurricuLLM-unique curriculum parameter (only sent to CurricuLLM, not OpenAI)
    if not settings.openai_api_key:
        curriculum = {}
        if stage:
            curriculum["stage"] = stage
        if subject:
            curriculum["subject"] = subject
        if curriculum:
            kwargs["extra_body"] = {"curriculum": curriculum}

    response = await client.chat.completions.create(**kwargs)
    return response


async def chat_json(
    messages: list[dict],
    stage: Optional[str] = None,
    subject: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> dict:
    """
    Structured JSON output call. Wraps chat() with response_format=json_object.
    Auto-parses the JSON response.
    """
    response = await chat(
        messages=messages,
        stage=stage,
        subject=subject,
        response_format={"type": "json_object"},
        temperature=temperature,
        max_tokens=max_tokens,
        stream=False,
    )

    content = response.choices[0].message.content.strip()

    # Strip markdown fences if model wraps them
    if content.startswith("```"):
        content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()

    return json.loads(content)
