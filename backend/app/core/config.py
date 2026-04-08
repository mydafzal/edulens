"""
EduLens Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # API Settings
    app_name: str = "EduLens API"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # CORS Settings
    frontend_url: str = "http://localhost:3000"

    # ── CurricuLLM API (sole LLM provider) ──
    curricullm_api_key: str = ""
    curricullm_base_url: str = "https://api.curricullm.com"
    curricullm_model: str = "CurricuLLM-AU"

    # ── Weaviate Vector DB ──
    weaviate_url: str = "http://localhost:8080"
    weaviate_api_key: Optional[str] = None

    # ── ERIC API ──
    eric_base_url: str = "https://api.ies.ed.gov/eric/"

    # ── Pipeline Settings ──
    consensus_threshold: float = 7.0
    max_pipeline_retries: int = 1
    max_sources: int = 10
    rerank_top_k: int = 6

    # Search Settings (legacy compat)
    default_search_limit: int = 20
    max_search_limit: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
