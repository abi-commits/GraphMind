from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_core.documents import Document
from langchain_chroma import Chroma
from abc import ABC, abstractmethod

from src.config.settings import settings
from src.config.logging import GraphMindException, logging
from src.components.processing.embeddings import EmbeddingGenerator


class VectorStore(ABC):
    @abstractmethod
    def add_documents(self, documents: List[Document]) -> None:
        """Add documents to the vector store."""
        pass

    @abstractmethod
    def query(self, query: str, top_k: int = 5, filter: Optional[dict] = None) -> List[Document]:
        """Query the vector store for similar documents."""
        pass
    
    @abstractmethod
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection."""
        pass


class ChromaVectorStore(VectorStore):
    client: 'Optional[Any]' = None
    vector_store: 'Optional[Chroma]' = None
    def __init__(self, embedding_generator: Optional[EmbeddingGenerator] = None) -> None:
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.client = None
        self.vector_store = None
        self.embedding_generator = embedding_generator
        
        # For ChromaDB Cloud, we don't need a local embedding generator
        if settings.CHROMA_USE_CLOUD:
            logging.info("ChromaDB Cloud mode: Using cloud-based embedding service")
        elif embedding_generator is None:
            raise GraphMindException("Embedding generator is required for non-cloud deployments")
        
        try:
            self._initialize_vector_store()
        except Exception as e:
            logging.error(f"ChromaVectorStore initialization failed: {e}")
            raise

    def _initialize_vector_store(self) -> None:
        """Initialize ChromaDB client and vector store."""
        try:
            
            if settings.CHROMA_USE_CLOUD and settings.CHROMA_API_KEY:
                # ChromaDB Cloud client
                self.client = chromadb.CloudClient(
                    api_key=settings.CHROMA_API_KEY,
                    tenant=settings.CHROMA_TENANT,
                    database=settings.CHROMA_DATABASE
                )
                logging.info(f"Connected to ChromaDB Cloud - Tenant: {settings.CHROMA_TENANT}, Database: {settings.CHROMA_DATABASE}")
                self.collection_name = settings.CHROMA_COLLECTION_NAME
                
            elif settings.CHROMA_HOST and settings.CHROMA_PORT and not settings.CHROMA_USE_CLOUD:
                # Remote server (self-hosted)
                self.client = chromadb.HttpClient(
                    host=settings.CHROMA_HOST,
                    port=settings.CHROMA_PORT
                )
                logging.info(f"Connected to ChromaDB server at {settings.CHROMA_HOST}:{settings.CHROMA_PORT}")
            else:
                # Local persistent storage
                self.client = chromadb.PersistentClient(
                    path=settings.VECTOR_STORE_PATH
                )
                logging.info(f"Using local ChromaDB at {settings.VECTOR_STORE_PATH}")

            # Initialize Chroma with newer version parameters
            if settings.CHROMA_USE_CLOUD:
                # ChromaDB Cloud handles embeddings automatically for ingestion, 
                # but langchain-chroma still needs an embedding function for queries
                # We'll use a lightweight embedding function for query compatibility
                if self.embedding_generator is None:
                    from src.components.processing.embeddings import EmbeddingGenerator
                    self.embedding_generator = EmbeddingGenerator()
                    logging.info("Created embedding generator for ChromaDB Cloud query compatibility")
                
                self.vector_store = Chroma(
                    client=self.client,
                    collection_name=self.collection_name,
                    embedding_function=self.embedding_generator,
                )
                logging.info("Using ChromaDB Cloud with built-in embedding service")
            elif settings.CHROMA_HOST and settings.CHROMA_PORT and not settings.CHROMA_USE_CLOUD:
                # For remote server, use local embedding function
                if self.embedding_generator is None:
                    raise GraphMindException("Embedding generator is required for remote server deployment")
                
                try:
                    test_result = self.embedding_generator(["test"])
                    logging.debug(f"Embedding generator test successful")
                except Exception as e:
                    logging.error(f"Embedding generator is not properly callable: {e}")
                    raise GraphMindException(f"Embedding generator is not properly callable: {e}")
                
                self.vector_store = Chroma(
                    client=self.client,
                    collection_name=self.collection_name,
                    embedding_function=self.embedding_generator,
                )
            else:
                # For local storage, use local embedding function
                if self.embedding_generator is None:
                    raise GraphMindException("Embedding generator is required for local storage deployment")
                
                try:
                    test_result = self.embedding_generator(["test"])
                    logging.debug(f"Embedding generator test successful")
                except Exception as e:
                    logging.error(f"Embedding generator is not properly callable: {e}")
                    raise GraphMindException(f"Embedding generator is not properly callable: {e}")
                
                self.vector_store = Chroma(
                    client=self.client,
                    collection_name=self.collection_name,
                    embedding_function=self.embedding_generator,
                    persist_directory=settings.VECTOR_STORE_PATH
                )
            
            logging.info(f"ChromaDB vector store initialized successfully with collection '{self.collection_name}'")
        except Exception as e:
            # Reset client and vector_store on failure
            self.client = None
            self.vector_store = None
            logging.error(f"Error initializing ChromaDB: {e}")
            raise GraphMindException(f"Error initializing ChromaDB: {e}")

    def _check_initialized(self) -> None:
        """Check if the vector store is properly initialized."""
        if self.client is None or self.vector_store is None:
            logging.error("ChromaDB is not initialized. self.client or self.vector_store is None.")
            raise GraphMindException("ChromaDB is not initialized. Please check your configuration and logs for details.")
    

    def add_documents(self, documents: List[Document]) -> None:
        self._check_initialized()
        assert self.vector_store is not None
        try:
            if not documents:
                logging.warning("No documents to add")
                return
                
            self.vector_store.add_documents(documents)
            logging.info(f"Added {len(documents)} documents to ChromaDB (collection: {self.collection_name}).")
            
        except Exception as e:
            logging.error(f"Error adding documents to ChromaDB: {e}")
            raise GraphMindException(f"Error adding documents to ChromaDB: {e}")

    def query(self, query: str, top_k: int = 5, filter: Optional[dict] = None) -> List[Document]:
        self._check_initialized()
        assert self.vector_store is not None
        try:
            if not query.strip():
                logging.warning("Empty query provided")
                return []
                
            kwargs = {"query": query, "k": top_k}
            if filter is not None:
                kwargs["filter"] = filter
                
            results = self.vector_store.similarity_search(**kwargs)
            logging.info(f"Query returned {len(results)} documents.")
            return results
        except Exception as e:
            logging.error(f"Error querying ChromaDB: {e}")
            raise GraphMindException(f"Error querying ChromaDB: {e}")

    def get_collection_stats(self) -> Dict[str, Any]:
        self._check_initialized()
        assert self.client is not None
        try:
            # Try to get the collection using the client
            collection = self.client.get_collection(self.collection_name)
            
            # Get collection stats
            count = collection.count()
            metadata = getattr(collection, 'metadata', {}) or {}
            
            return {
                "count": count,
                "metadata": metadata,
                "collection_name": self.collection_name
            }
        except Exception as e:
            error_msg = str(e).lower()
            # Check for various ways collections might not exist
            if any(phrase in error_msg for phrase in ["does not exist", "not found", "no collection", "collection not found"]):
                logging.warning(f"Collection '{self.collection_name}' does not exist yet.")
                return {
                    "count": 0, 
                    "metadata": {},
                    "collection_name": self.collection_name,
                    "status": "not_found"
                }
            else:
                logging.error(f"Error getting collection stats: {e}")
                raise GraphMindException(f"Error getting collection stats: {e}")

    def delete_documents(self, ids: Optional[List[str]] = None, where: Optional[dict] = None) -> None:
        self._check_initialized()
        assert self.vector_store is not None
        try:
            if ids is not None:
                self.vector_store.delete(ids=ids)
            elif where is not None:
                self.vector_store.delete(where=where)
            else:
                logging.warning("No IDs or filter provided for deletion")
                return

            # Persistence is handled automatically in newer versions
            logging.info(f"Deleted documents from ChromaDB (collection: {self.collection_name}).")

        except Exception as e:
            raise GraphMindException(f"Error deleting documents: {e}")

    def health_check(self) -> Dict[str, Any]:
        """Check the health of the vector store."""
        try:
            # Check if initialized
            if self.client is None or self.vector_store is None:
                return {"status": "unhealthy", "error": "Vector store not initialized"}
            
            # Check client connection
            try:
                # Try to get collection stats as a connection test
                stats = self.get_collection_stats()
                collection_exists = stats.get("count", 0) >= 0 
            except Exception as e:
                return {"status": "unhealthy", "error": f"Cannot access collection: {str(e)}"}
            
            # Test embedding function (only for non-cloud deployments)
            if not settings.CHROMA_USE_CLOUD and self.embedding_generator is not None:
                try:
                    test_embedding = self.embedding_generator(["health check test"])
                    if not test_embedding or len(test_embedding) == 0:
                        return {"status": "unhealthy", "error": "Embedding generator returned empty result"}
                except Exception as e:
                    return {"status": "unhealthy", "error": f"Embedding generator failed: {str(e)}"}
            
            return {
                "status": "healthy",
                "collection_exists": collection_exists,
                "document_count": stats.get("count", 0),
                "collection_name": self.collection_name
            }
            
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    def similarity_search_with_scores(self, query: str, top_k: int = 5, filter: Optional[dict] = None) -> List[tuple]:
        """Perform similarity search and return documents with relevance scores."""
        self._check_initialized()
        assert self.vector_store is not None
        try:
            if not query.strip():
                logging.warning("Empty query provided")
                return []
                
            kwargs = {"query": query, "k": top_k}
            if filter is not None:
                kwargs["filter"] = filter
                
            # Use similarity_search_with_score if available
            if hasattr(self.vector_store, 'similarity_search_with_score'):
                results = self.vector_store.similarity_search_with_score(**kwargs)
            else:
                # Fallback to regular similarity search
                docs = self.vector_store.similarity_search(**kwargs)
                results = [(doc, 0.0) for doc in docs]  # No scores available
                
            logging.info(f"Query with scores returned {len(results)} documents.")
            return results
        except Exception as e:
            logging.error(f"Error in similarity search with scores: {e}")
            raise GraphMindException(f"Error in similarity search with scores: {e}")
    
    def get_retriever(self, search_kwargs: Optional[Dict[str, Any]] = None):
        """Get a LangChain retriever interface for this vector store."""
        self._check_initialized()
        assert self.vector_store is not None
        
        if search_kwargs is None:
            search_kwargs = {"k": 5}
            
        return self.vector_store.as_retriever(search_kwargs=search_kwargs)


# Factory function to create vector store instance
def create_vector_store(embedding_generator: Optional[EmbeddingGenerator] = None) -> ChromaVectorStore:
    """Create and return a ChromaVectorStore instance.
    
    Args:
        embedding_generator: Optional embedding generator. Not needed for ChromaDB Cloud.
        
    Returns:
        ChromaVectorStore: A configured vector store instance
    """
    try:
        logging.info("Creating ChromaVectorStore instance...")
        
        # For ChromaDB Cloud, we still need embedding generator for query compatibility
        if settings.CHROMA_USE_CLOUD:
            if embedding_generator is None:
                from src.components.processing.embeddings import EmbeddingGenerator
                embedding_generator = EmbeddingGenerator()
            vector_store = ChromaVectorStore(embedding_generator=embedding_generator)
            logging.info("Using ChromaDB Cloud with built-in embedding service")
        else:
            if embedding_generator is None:
                raise GraphMindException("Embedding generator is required for non-cloud deployments")
            vector_store = ChromaVectorStore(embedding_generator=embedding_generator)
        
        # Test the vector store health
        health = vector_store.health_check()
        if health["status"] != "healthy":
            logging.warning(f"Vector store health check failed: {health}")
        else:
            logging.info("Vector store created and healthy")
            
        return vector_store
    except Exception as e:
        logging.error(f"Failed to create vector store: {e}")
        raise GraphMindException(f"Failed to create vector store: {e}")



