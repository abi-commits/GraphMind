from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter, 
    TokenTextSplitter,
)
from langchain.schema import Document
from src.config.settings import settings
from src.config.logging import GraphMindException, logging


# --- Abstract Factory Interface ---
class SplitterFactory(ABC):
    """Abstract Factory interface for creating text splitters."""

    @abstractmethod
    def create_splitter(self):
        pass


# --- Concrete Factories ---
class RecursiveSplitterFactory(SplitterFactory):
    def create_splitter(self):
        return RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", " ", ""],
            is_separator_regex=False,
        )


class TokenSplitterFactory(SplitterFactory):
    def create_splitter(self):
        return TokenTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            model_name=settings.EMBEDDING_MODEL,
        )



# --- Client Class ---
class Chunker:
    """Chunker uses a factory to obtain the appropriate text splitter."""

    def __init__(self, factory: SplitterFactory):
        self.splitter: Any = factory.create_splitter()

    def chunk_documents(self, documents: List[Document], **kwargs) -> List[Document]:
        try:
            if not documents:
                logging.warning("No documents provided for chunking")
                return []
            return self.splitter.split_documents(documents, **kwargs)
        except Exception as e:
            logging.error(f"Error chunking documents: {str(e)}")
            raise GraphMindException(f"Error chunking documents: {e}")

    def chunk_text(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[Document]:
        try:
            if not text or not text.strip():
                logging.warning("Empty text provided for chunking")
                return []
            doc_metadata = metadata or {}
            temp_doc = Document(page_content=text, metadata=doc_metadata)
            return self.chunk_documents([temp_doc])
        except Exception as e:
            logging.error(f"Error chunking text: {str(e)}")
            raise GraphMindException(f"Error chunking text: {e}")


# --- Factory Selector / Utility ---
def create_chunker(strategy: str = "recursive") -> Chunker:
    factories = {
        "recursive": RecursiveSplitterFactory(),
        "token": TokenSplitterFactory(),
    }

    if strategy not in factories:
        raise GraphMindException(f"Unknown chunking strategy: {strategy}")

    return Chunker(factory=factories[strategy])


# --- Example Usage ---
if __name__ == "__main__":
    chunker = create_chunker("recursive")
    text_chunks = chunker.chunk_text("This is some sample text to chunk.")
    print(text_chunks)

