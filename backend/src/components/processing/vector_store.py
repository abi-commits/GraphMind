from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
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
    def __init__(self, embedding_generator: EmbeddingGenerator) -> None:
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self.client = None
        self.vector_store = None
        self.embedding_generator = embedding_generator
        try:
            self._initialize_vector_store()
        except Exception as e:
            logging.error(f"ChromaVectorStore initialization failed: {e}")
            raise

    def _initialize_vector_store(self) -> None:
        """Initialize ChromaDB client and vector store."""
        try:
            # Handle different deployment scenarios
            if settings.CHROMA_HOST and settings.CHROMA_PORT:
                # Remote server
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
                logging.info(f"Using persistent ChromaDB at {settings.VECTOR_STORE_PATH}")

            # Initialize the LangChain Chroma wrapper
            self.vector_store = Chroma(
                client=self.client,
                collection_name=self.collection_name,
                embedding_function=self.embedding_generator,
                persist_directory=settings.VECTOR_STORE_PATH if not (settings.CHROMA_HOST and settings.CHROMA_PORT) else None
            )
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
            self.vector_store.add_documents(documents)
            # Only persist if using local storage
            if not (settings.CHROMA_HOST and settings.CHROMA_PORT):
                self.vector_store.persist()
            logging.info(f"Added {len(documents)} documents to ChromaDB (collection: {self.collection_name}).")
        except Exception as e:
            raise GraphMindException(f"Error adding documents to ChromaDB: {e}")

    def query(self, query: str, top_k: int = 5, filter: Optional[dict] = None) -> List[Document]:
        self._check_initialized()
        assert self.vector_store is not None
        try:
            results = self.vector_store.similarity_search(
                query=query,
                k=top_k,
                filter=filter,
            )
            logging.info(f"Query returned {len(results)} documents.")
            return results
        except Exception as e:
            raise GraphMindException(f"Error querying ChromaDB: {e}")

    def get_collection_stats(self) -> Dict[str, Any]:
        self._check_initialized()
        assert self.client is not None
        try:
            # Get the collection using the client
            collection = self.client.get_collection(self.collection_name)
            return {
                "count": collection.count(),
                "metadata": collection.metadata
            }
        except Exception as e:
            # If collection doesn't exist, return empty stats
            if "does not exist" in str(e).lower() or "not found" in str(e).lower():
                logging.warning(f"Collection {self.collection_name} does not exist yet.")
                return {"count": 0, "metadata": {}}
            else:
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

            # Only persist if using local storage
            if not (settings.CHROMA_HOST and settings.CHROMA_PORT):
                self.vector_store.persist()

        except Exception as e:
            raise GraphMindException(f"Error deleting documents: {e}")

    def update_document(self, document_id: str, document: Document) -> None:
        self._check_initialized()
        assert self.vector_store is not None
        try:
            # In ChromaDB, update is implemented as delete + add
            self.delete_documents(ids=[document_id])
            self.add_documents([document])
        except Exception as e:
            raise GraphMindException(f"Error updating document: {e}")

    def health_check(self):
        """Check the health of the vector store."""
        try:
            # Perform a simple operation to verify the vector store is accessible
            self.query("test", top_k=1)
            return {"status": "healthy"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}


# Factory function to create vector store instance
def create_vector_store(embedding_generator: EmbeddingGenerator) -> ChromaVectorStore:
    """Create and return a ChromaVectorStore instance."""
    return ChromaVectorStore(embedding_generator=embedding_generator)


# Example usage (commented out to avoid import-time execution)
# if __name__ == "__main__":
#     # Initialize the embedding generator first
#     embedding_generator = EmbeddingGenerator()
#     
#     # Then create the vector store
#     vector_store = create_vector_store(embedding_generator)
#     
#     stats = vector_store.get_collection_stats()
#     print(f"Collection stats: {stats}")
#     
#     documents = [Document(page_content="This is a sample document.", metadata={"source": "sample1"})]
#     
#     vector_store.add_documents(documents)
#     
#     results = vector_store.query("the sample document")

