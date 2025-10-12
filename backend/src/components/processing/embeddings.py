from langchain_huggingface import HuggingFaceEmbeddings
from langchain.embeddings.base import Embeddings
from typing import List
from src.config.settings import settings
from src.config.logging import GraphMindException, logging

class EmbeddingGenerator(Embeddings):
    def __init__(self) -> None:
        model_name = settings.EMBEDDING_MODEL
        self.embedding_model = HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': settings.EMBEDDING_DEVICE},
            encode_kwargs={
                'normalize_embeddings': True,
                'batch_size': settings.EMBEDDING_BATCH_SIZE
            }
        )
        logging.info(f"Initialized HuggingFaceEmbeddings with model: {model_name}")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        try:
            return self.embedding_model.embed_documents(texts)
        except Exception as e:
            logging.error(f"Error embedding documents: {str(e)}")
            raise GraphMindException(f"Error embedding documents: {e}")

    def embed_query(self, query: str) -> List[float]:
        try:
            return self.embedding_model.embed_query(query)
        except Exception as e:
            logging.error(f"Error embedding query: {str(e)}")
            raise GraphMindException(f"Error embedding query: {e}")
    
    def embed_documents_batch(self, texts: List[str], batch_size: int) -> List[List[float]]:
        """Process embeddings in batches to manage memory usage"""
        try:
            if batch_size is None:
                batch_size = settings.EMBEDDING_BATCH_SIZE
                
            all_embeddings = []
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                batch_embeddings = self.embed_documents(batch)
                all_embeddings.extend(batch_embeddings)
                logging.info(f"Processed batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
            return all_embeddings
        except Exception as e:
            logging.error(f"Error in batch embedding: {str(e)}")
            raise GraphMindException(f"Error in batch embedding: {e}")