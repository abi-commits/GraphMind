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
    
    # Model settings
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 200
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_FILE_TYPES: list[str] = ["pdf", "docx", "txt", "md", "html"]
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_DEVICE: str = "cpu"  # e.g., "cpu" or "cuda"
    OPENAI_MODEL: str = "gpt-4"

    # API settings
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Storage settings
    DATA_DIR: str = "./data"
    
    @property
    def VECTOR_STORE_PATH(self) -> str:
        return os.path.join(self.DATA_DIR, "vectorstore")

    # ChromaDB settings
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8000
    CHROMA_COLLECTION_NAME: str = "graphmind_collection"

    # Security
    OPENAI_API_KEY: str = ""

    # AWS S3 settings
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str = ""

    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_DB: int = 0

settings = Settings()