"""
Trust Tier Service — Rule-based source classification.

No LLM call needed. This runs on the server in <1ms.
Classifies sources into Gold / Silver / Bronze based on domain/provider.
"""

from urllib.parse import urlparse

# ── Trust Tier Definitions ──
# Gold: Government, peer-reviewed, institutional sources
# Silver: Reputable educational organizations, universities
# Bronze: Community, user-uploaded, unverified

GOLD_DOMAINS = {
    # Australian Government & Institutional
    "eric.ed.gov", "www.eric.ed.gov",
    "education.gov.au", "www.education.gov.au",
    "acara.edu.au", "www.acara.edu.au",
    "aiatsis.gov.au", "www.aiatsis.gov.au",
    "csiro.au", "www.csiro.au",
    "bom.gov.au", "www.bom.gov.au",
    "nla.gov.au", "www.nla.gov.au",
    "abs.gov.au", "www.abs.gov.au",
    # NZ Curriculum
    "nzqa.govt.nz", "www.nzqa.govt.nz",
    "education.govt.nz", "www.education.govt.nz",
    # International peer-reviewed
    "oercommons.org", "www.oercommons.org",
    "arxiv.org",
    "doi.org",
    "jstor.org", "www.jstor.org",
    "pubmed.ncbi.nlm.nih.gov",
}

SILVER_DOMAINS = {
    # Reputable educational content
    "education.abc.net.au",
    "abc.net.au",
    "khanacademy.org", "www.khanacademy.org",
    "ted.com", "www.ted.com",
    "nationalgeographic.com",
    "britannica.com", "www.britannica.com",
    "bbc.co.uk",
    # Universities (pattern-matched separately)
}

GOLD_PROVIDERS = {
    "ERIC", "ACARA", "AIATSIS", "CSIRO", "BOM",
    "Bureau of Meteorology", "OER Commons", "NZQA",
    "National Library of Australia",
}

SILVER_PROVIDERS = {
    "ABC Education", "Khan Academy", "BBC Education",
    "National Geographic", "Britannica",
}


def classify_trust_tier(url: str = "", provider: str = "") -> str:
    """
    Classify a source into gold/silver/bronze trust tier.
    Pure rule-based — no LLM call.

    Args:
        url: Source URL
        provider: Source provider name

    Returns:
        "gold", "silver", or "bronze"
    """
    # Check provider name first (fastest)
    if provider in GOLD_PROVIDERS:
        return "gold"
    if provider in SILVER_PROVIDERS:
        return "silver"

    # Check domain
    if url:
        try:
            domain = urlparse(url).netloc.lower()

            if domain in GOLD_DOMAINS:
                return "gold"
            if domain in SILVER_DOMAINS:
                return "silver"

            # University pattern: *.edu.au, *.edu, *.ac.uk, *.ac.nz
            if any(domain.endswith(suffix) for suffix in [".edu.au", ".edu", ".ac.uk", ".ac.nz"]):
                return "silver"

            # Government pattern: *.gov.au, *.govt.nz, *.gov
            if any(domain.endswith(suffix) for suffix in [".gov.au", ".govt.nz", ".gov"]):
                return "gold"
        except Exception:
            pass

    return "bronze"
