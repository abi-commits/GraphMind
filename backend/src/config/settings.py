import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )
    
    # Application settings
    APP_NAME: str = "GraphMind"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Document Processing settings
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 200
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_FILE_TYPES: list[str] = ["pdf", "docx", "txt", "md", "html"]
    
    # LLM Model settings
    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_PROVIDER: str = "gemini" 

    # API settings
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]  # Default to wildcard for local/dev. Override in env for production.
    
    # Embeddings model (optional; in production CHROMA_USE_CLOUD will handle embeddings)
    EMBEDDING_MODEL: str | None = None
    EMBEDDING_DEVICE: str | None = None
    EMBEDDING_BATCH_SIZE: int = 16
    
    # Timeout settings (in seconds)
    REQUEST_TIMEOUT: int = 300  # 5 minutes for query processing
    LLM_TIMEOUT: int = 120   # 2 minutes for LLM API calls
    
    # Storage settings
    DATA_DIR: str = "./data"
    
    # ChromaDB Cloud settings (Production)
    CHROMA_API_KEY: str = ""
    CHROMA_TENANT: str = ""
    CHROMA_DATABASE: str = ""
    CHROMA_COLLECTION_NAME: str = "graphmind_collection"
    CHROMA_USE_CLOUD: bool = True  # Production uses ChromaDB Cloud only  
    
    # LLM API Keys
    GOOGLE_API_KEY: str = ""  # Gemini API key

    # AWS S3 settings
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = ""

    # Redis settings
    REDIS_URL: str = ""
  

settings = Settings()