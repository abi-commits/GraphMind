import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "GraphMind"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Model settings
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 200
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_FILE_TYPES: list[str] = ["pdf", "docx", "txt", "md", "html"]
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_DEVICE: str = os.getenv("EMBEDDING_DEVICE", "cpu")  # e.g., "cpu" or "cuda"


    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")

    # API settings
    API_PREFIX: str = "/api/v1"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    
    # Storage settings
    DATA_DIR: str = os.getenv("DATA_DIR", "./data")
    VECTOR_STORE_PATH: str = os.path.join(DATA_DIR, "vectorstore")

    # ChromaDB settings
    CHROMA_HOST: str = os.getenv("CHROMA_HOST", "localhost")
    CHROMA_PORT: int = int(os.getenv("CHROMA_PORT", 8000))
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "graphmind_collection")

    # Security
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()