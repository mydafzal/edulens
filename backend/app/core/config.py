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

    # Database
    database_url: str = "postgresql+asyncpg://scora:scora_secret@localhost:5432/scora_db"
    database_url_sync: str = "postgresql+psycopg2://scora:scora_secret@localhost:5432/scora_db"

    # Auth
    secret_key: str = "scora-super-secret-key-change-in-production"

    # AI Provider Settings
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # CurricuLLM
    curricullm_api_key: Optional[str] = None
    curricullm_base_url: str = "https://api.curricullm.com"
    curricullm_model: str = "CurricuLLM-AU"

    # ERIC
    eric_base_url: str = "https://api.ies.ed.gov/eric/"

    # Pipeline tuning
    consensus_threshold: float = 7.0
    max_pipeline_retries: int = 1
    max_sources: int = 10
    rerank_top_k: int = 6

    # Search Settings
    default_search_limit: int = 20
    max_search_limit: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
