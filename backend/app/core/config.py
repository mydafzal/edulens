"""
EduLens Configuration
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # API Settings
    app_name: str = "EduLens API"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    # CORS Settings
    frontend_url: str = "http://localhost:3000"

    # AI Provider Settings
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Search Settings
    default_search_limit: int = 20
    max_search_limit: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
