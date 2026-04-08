"""
ERIC API Service — Free access to 1.5M+ verified educational resources.

ERIC (Education Resources Information Center) is the world's largest
digital library of education literature. No API key required.

API docs: https://api.ies.ed.gov/eric/
"""

import httpx
from typing import Optional
from app.core.config import settings


# Grade level → ERIC education level mapping
GRADE_TO_ERIC_LEVEL = {
    "early-years": "Early Childhood Education",
    "primary": "Elementary Education",
    "middle": "Middle Schools",
    "senior": "High Schools",
    "tertiary": "Higher Education",
}


async def search_eric(
    query: str,
    grade_level: Optional[str] = None,
    subject: Optional[str] = None,
    max_results: int = 10,
    peer_reviewed: bool = True,
) -> list[dict]:
    """
    Search ERIC for educational resources.

    Args:
        query: Search query string
        grade_level: Our grade level ID (early-years, primary, middle, senior, tertiary)
        subject: Optional subject filter
        max_results: Number of results to return
        peer_reviewed: Whether to filter for peer-reviewed only

    Returns:
        List of ERIC resource dicts with title, url, snippet, authors, etc.
    """
    params = {
        "search": query,
        "rows": max_results,
        "format": "json",
        "fields": "id,title,author,source,publicationdatejulian,description,subject,peerreviewed,url,educationlevel",
    }

    # Add education level filter
    if grade_level and grade_level in GRADE_TO_ERIC_LEVEL:
        eric_level = GRADE_TO_ERIC_LEVEL[grade_level]
        params["search"] = f'{query} AND educationlevel:"{eric_level}"'

    # Add subject filter
    if subject:
        params["search"] = f'{params["search"]} AND subject:"{subject}"'

    # Filter peer-reviewed
    if peer_reviewed:
        params["search"] = f'{params["search"]} AND peerreviewed:"Yes"'

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(settings.eric_base_url, params=params)
        response.raise_for_status()
        data = response.json()

    results = []
    docs = data.get("response", {}).get("docs", [])

    for doc in docs:
        results.append({
            "id": f"eric-{doc.get('id', '')}",
            "title": doc.get("title", "Untitled"),
            "authors": doc.get("author", []),
            "snippet": (doc.get("description", "") or "")[:300],
            "url": f"https://eric.ed.gov/?id={doc.get('id', '')}",
            "source": doc.get("source", "ERIC"),
            "publish_date": doc.get("publicationdatejulian", ""),
            "subjects": doc.get("subject", []),
            "education_levels": doc.get("educationlevel", []),
            "peer_reviewed": doc.get("peerreviewed", "No") == "Yes",
            "provider": "ERIC",
            "trust_tier": "gold",  # ERIC = peer-reviewed, government-funded
        })

    return results
