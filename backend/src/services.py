"""
Singleton services for GraphMind components.
Provides centralized, thread-safe access to expensive resources like embedding generators and vector stores.
"""
from typing import Optional
import threading
from src.components.processing.embeddings import EmbeddingGenerator
from src.components.processing.vector_store import ChromaVectorStore

from src.config.logging import logging, GraphMindException


class GraphMindServices:
    """Singleton container for shared GraphMind services."""
    
    _instance: Optional['GraphMindServices'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'GraphMindServices':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if hasattr(self, '_initialized') and self._initialized:
            return
            
        self._embedding_generator: Optional[EmbeddingGenerator] = None
        self._vector_store: Optional[ChromaVectorStore] = None
        self._embedding_lock = threading.Lock()
        self._vector_store_lock = threading.Lock()
        self._initialized = True
    
    def get_embedding_generator(self):
        """Get thread-safe singleton embedding generator instance."""
        from src.config.settings import settings
        
        # For ChromaDB Cloud, we don't need a local embedding generator
        if settings.CHROMA_USE_CLOUD:
            logging.info("ChromaDB Cloud mode: Skipping local embedding generator initialization")
            return None
            
        if self._embedding_generator is None:
            with self._embedding_lock:
                if self._embedding_generator is None:
                    logging.info("Initializing singleton EmbeddingGenerator")
                    try:
                        from src.components.processing.embeddings import EmbeddingGenerator
                        self._embedding_generator = EmbeddingGenerator()
                    except Exception as e:
                        logging.error(f"Failed to initialize EmbeddingGenerator: {e}")
                        raise GraphMindException(f"Failed to initialize EmbeddingGenerator: {e}")
        return self._embedding_generator
    
    def get_vector_store(self):
        """Get thread-safe singleton vector store instance."""
        if self._vector_store is None:
            with self._vector_store_lock:
                if self._vector_store is None:
                    logging.info("Initializing singleton ChromaVectorStore")
                    try:
                        from src.components.processing.vector_store import create_vector_store
                        from src.config.settings import settings
                        
                        # For ChromaDB Cloud, we don't need an embedding generator
                        if settings.CHROMA_USE_CLOUD:
                            self._vector_store = create_vector_store(embedding_generator=None)
                        else:
                            embedding_generator = self.get_embedding_generator()
                            self._vector_store = create_vector_store(embedding_generator)
                    except Exception as e:
                        logging.error(f"Failed to initialize ChromaVectorStore: {e}")
                        raise GraphMindException(f"Failed to initialize ChromaVectorStore: {e}")
        return self._vector_store
    
    def reset(self):
        """Reset all services (useful for testing or reinitialization)."""
        with self._embedding_lock, self._vector_store_lock:
            logging.info("Resetting GraphMind services")
            self._embedding_generator = None
            self._vector_store = None
    
    def health_check(self) -> dict:
        """Perform health checks on all services."""
        from src.config.settings import settings
        
        health_status = {
            "embedding_generator": "not_needed" if settings.CHROMA_USE_CLOUD else "not_initialized",
            "vector_store": "not_initialized"
        }
        
        try:
            if not settings.CHROMA_USE_CLOUD and self._embedding_generator is not None:
                # Simple check - embedding generator doesn't have built-in health check
                health_status["embedding_generator"] = "healthy"
            elif settings.CHROMA_USE_CLOUD:
                health_status["embedding_generator"] = "cloud_managed"
            
            if self._vector_store is not None:
                vs_health = self._vector_store.health_check()
                health_status["vector_store"] = vs_health.get("status", "unknown")
        except Exception as e:
            logging.error(f"Health check failed: {e}")
            health_status["error"] = str(e)
        
        return health_status


# Global singleton instance
_services = GraphMindServices()

# Convenience functions for easy access
def get_embedding_generator():
    """Get the singleton embedding generator instance."""
    return _services.get_embedding_generator()

def get_vector_store():
    """Get the singleton vector store instance."""
    return _services.get_vector_store()

def get_services() -> GraphMindServices:
    """Get the services container instance."""
    return _services

def reset_services():
    """Reset all services (useful for testing)."""
    _services.reset()

def services_health_check() -> dict:
    """Get health status of all services."""
    return _services.health_check()