import os
from pydantic import BaseSettings
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

    # OpenAI Settings
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

    # Storage Settings
    data_dir: str = os.getenv("DATA_DIR", "data")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()