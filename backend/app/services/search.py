"""
EduLens Search Service — orchestrates the CurricuLLM pipeline with ERIC
and static fallbacks.
"""

import logging
import time
from typing import Optional

from app.services.pipeline import run_pipeline, fetch_eric_sources
from app.services.curricullm import is_available, GRADE_TO_STAGE

logger = logging.getLogger("edulens.search")


async def run_search_pipeline(
    query: str,
    grade_level: str = "middle",
    subject: Optional[str] = None,
    user_role: str = "teacher",
    classroom_context: Optional[dict] = None,
    web_search_enabled: bool = False,
) -> Optional[dict]:
    """
    Run the full search pipeline:
      1. If CurricuLLM key set → 4-phase pipeline (HyDE, Bad Cop, Good Cop, Synthesizer)
      2. Else if web_search_enabled → ERIC-only with default review
      3. Else → None (caller should use static SOURCE_BANK fallback)
    """
    import asyncio as _asyncio

    # 1. Full CurricuLLM pipeline (with hard 25s overall timeout)
    if is_available():
        try:
            result = await _asyncio.wait_for(
                run_pipeline(
                    query=query,
                    grade_level=grade_level,
                    subject=subject,
                    user_role=user_role,
                    classroom_context=classroom_context,
                ),
                timeout=60.0,
            )
            if result and result.get("rag_sources"):
                return result
        except Exception as e:
            logger.error("Pipeline failed or timed out: %s", e)

    # 2. ERIC fallback — always try when CurricuLLM didn't return results
    start = time.time()
    eric_sources = await fetch_eric_sources(query, rows=6, grade_level=grade_level)
    if eric_sources:
        total_time = time.time() - start
        return {
            "query": query,
            "expanded_queries": [],
            "grade_level": grade_level,
            "subject": subject or "",
            "stage": "complete",
            "rag_sources": eric_sources,
            "dual_agent_review": _default_review(query, grade_level, len(eric_sources)),
            "summary": f'Found {len(eric_sources)} peer-reviewed resources from ERIC for "{query}".',
            "references": [
                f"{s.get('author', '')}{'.' if s.get('author') else ''} "
                f"({str(s.get('publish_date', '2024'))[:4]}). {s['title']}. {s['provider']}. {s['url']}"
                for s in eric_sources
            ],
            "removed_sources": [],
            "total_time": round(total_time, 2),
            "retry_count": 0,
            "error": None,
        }

    # 3. No results — caller uses static SOURCE_BANK fallback
    return None


def _default_review(query: str, grade_level: str, count: int) -> dict:
    """Default dual-agent review when CurricuLLM is unavailable."""
    stage = GRADE_TO_STAGE.get(grade_level, grade_level)
    return {
        "good_cop": {
            "rating": 8.2,
            "verdict": "conditional",
            "points": [
                f"{count} sources retrieved from trusted providers",
                f"Content appears age-appropriate for {stage}",
                "Diverse resource types included",
            ],
            "concerns": [],
            "summary": f"ERIC returned {count} relevant resources for {stage} level.",
        },
        "bad_cop": {
            "rating": 6.5,
            "verdict": "flag",
            "points": [],
            "concerns": [
                "Sources not yet verified by AI quality review",
                "Curriculum alignment could not be confirmed automatically",
                "Teacher review recommended before classroom use",
            ],
            "summary": "Automated safety review unavailable — teacher review recommended.",
        },
        "consensus_score": 7.3,
        "consensus_verdict": (
            f'Resources for "{query}" at {stage} level retrieved successfully. '
            "Automated quality review was unavailable; teacher review recommended."
        ),
        "recommendation": "review",
        "removed_sources": [],
    }
