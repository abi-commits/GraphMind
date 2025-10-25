import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    api_prefix: str = "/api/v1"
    project_name: str = "GraphMind"
    version: str = "1.0.0"

    # Model Settings
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    embedding_dim: int = 384
    chunk_size: int = 500
    chunk_overlap: int = 50

    # LLM Settings
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    llm_model: str = os.getenv("LLM_MODEL", "gemini-2.5-flash")
    google_api_key: Optional[str] = os.getenv("GOOGLE_API_KEY")

    # Storage Settings
    data_dir: str = os.getenv("DATA_DIR", "data")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()