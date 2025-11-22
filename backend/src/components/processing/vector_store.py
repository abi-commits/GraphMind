from typing import List, Optional, Dict, Any
import chromadb
from langchain_core.documents import Document
from abc import ABC, abstractmethod

from src.config.settings import settings
from src.config.logging import GraphMindException, logging


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
    """ChromaDB Cloud vector store - production ready with cloud-managed embeddings."""
    
    client: Optional[Any] = None
    vector_store: Optional[Any] = None
    
    def __init__(self) -> None:
        """Initialize ChromaDB Cloud vector store."""
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.client = None
        self.vector_store = None
        
        if not settings.CHROMA_USE_CLOUD:
            raise GraphMindException("Only ChromaDB Cloud mode is supported in production")
        
        if not settings.CHROMA_API_KEY:
            raise GraphMindException("CHROMA_API_KEY is required for ChromaDB Cloud")
            
        logging.info("ChromaDB Cloud mode: Using cloud-based embedding service")
        
        try:
            self._initialize_vector_store()
        except Exception as e:
            logging.error(f"ChromaVectorStore initialization failed: {e}")
            raise

    def _initialize_vector_store(self) -> None:
        """Initialize ChromaDB Cloud client and vector store."""
        try:
            # ChromaDB Cloud client
            self.client = chromadb.CloudClient(
                api_key=settings.CHROMA_API_KEY,
                tenant=settings.CHROMA_TENANT,
                database=settings.CHROMA_DATABASE
            )
            logging.info(f"Connected to ChromaDB Cloud - Tenant: {settings.CHROMA_TENANT}, Database: {settings.CHROMA_DATABASE}")
            
            try:
                from langchain_chroma import Chroma  # type: ignore

                # Initialize Chroma vector store - Cloud handles all embeddings
                self.vector_store = Chroma(
                    client=self.client,
                    collection_name=self.collection_name,
                )
                logging.info(f"ChromaDB Cloud vector store (langchain wrapper) initialized successfully with collection '{self.collection_name}'")
            except Exception as e:
                # LangChain wrapper or optional deps not available; continue with client-only mode
                self.vector_store = None
                logging.warning(
                    f"LangChain Chroma wrapper not available; falling back to chromadb client-only mode. Some features (add/query) may be limited: {e}"
                )
            
        except Exception as e:
            # Reset client and vector_store on failure
            self.client = None
            self.vector_store = None
            logging.error(f"Error initializing ChromaDB Cloud: {e}")
            raise GraphMindException(f"Error initializing ChromaDB Cloud: {e}")

    def _check_client_initialized(self) -> None:
        """Ensure the ChromaDB client is initialized. LangChain wrapper may be optional."""
        if self.client is None:
            logging.error("ChromaDB client is not initialized.")
            raise GraphMindException("ChromaDB client is not initialized. Please check CHROMA_API_KEY, CHROMA_TENANT and network connectivity.")
    

    def add_documents(self, documents: List[Document]) -> None:
        self._check_client_initialized()
        if self.vector_store is None:
            raise GraphMindException(
                "LangChain Chroma wrapper is not available in this runtime. Install 'langchain-chroma' and its optional deps (or enable local embedding generator) to use add/query features."
            )
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
        self._check_client_initialized()
        if self.vector_store is None:
            raise GraphMindException(
                "LangChain Chroma wrapper is not available in this runtime. Install 'langchain-chroma' and its optional deps to enable query functionality."
            )
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
        # Only require the chromadb client for stats; LangChain wrapper optional
        self._check_client_initialized()
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
        self._check_client_initialized()
        if self.vector_store is None:
            raise GraphMindException(
                "LangChain Chroma wrapper is not available in this runtime. Install 'langchain-chroma' to enable delete functionality."
            )
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
        """Check the health of the ChromaDB Cloud vector store."""
        try:
            # Require at least the client to be initialized
            if self.client is None:
                return {"status": "unhealthy", "error": "ChromaDB client not initialized"}
            
            # Check client connection
            try:
                # Try to get collection stats as a connection test
                stats = self.get_collection_stats()
                collection_exists = stats.get("count", 0) >= 0 
            except Exception as e:
                return {"status": "unhealthy", "error": f"Cannot access collection: {str(e)}"}
            
            return {
                "status": "healthy",
                "mode": "cloud",
                "collection_exists": collection_exists,
                "document_count": stats.get("count", 0),
                "collection_name": self.collection_name
            }
            
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    def similarity_search_with_scores(self, query: str, top_k: int = 5, filter: Optional[dict] = None) -> List[tuple]:
        """Perform similarity search and return documents with relevance scores."""
        self._check_client_initialized()
        if self.vector_store is None:
            raise GraphMindException(
                "LangChain Chroma wrapper is not available in this runtime. Install 'langchain-chroma' to enable similarity search with scores."
            )
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
        self._check_client_initialized()
        if self.vector_store is None:
            raise GraphMindException(
                "LangChain Chroma wrapper is not available in this runtime. Install 'langchain-chroma' to get a LangChain retriever."
            )
        
        if search_kwargs is None:
            search_kwargs = {"k": 5}
            
        return self.vector_store.as_retriever(search_kwargs=search_kwargs)


# Factory function to create vector store instance
def create_vector_store() -> ChromaVectorStore:
    """Create and return a ChromaVectorStore instance (ChromaDB Cloud only).
    
    Returns:
        ChromaVectorStore: A configured ChromaDB Cloud vector store instance
    """
    try:
        logging.info("Creating ChromaDB Cloud vector store...")
        vector_store = ChromaVectorStore()
        
        # Test the vector store health
        health = vector_store.health_check()
        if health["status"] != "healthy":
            logging.warning(f"Vector store health check failed: {health}")
        else:
            logging.info("ChromaDB Cloud vector store created and healthy")
            
        return vector_store
    except Exception as e:
        logging.error(f"Failed to create vector store: {e}")
        raise GraphMindException(f"Failed to create vector store: {e}")



