from langgraph.graph import StateGraph, END
from src.workflows.state import GraphState
from src.components.processing.vector_store import VectorStore
from src.components.data_ingestion.doc_loader import DocumentLoader
from src.components.processing.chunking import create_chunker, Chunker
from src.components.processing.embeddings import EmbeddingGenerator
from src.components.processing.vector_store import create_vector_store
from src.config.settings import settings
from src.config.logging import logging, GraphMindException

document_loader = DocumentLoader()
embedding_generator = EmbeddingGenerator()
vector_store = create_vector_store(embedding_generator)

def ingestion_workflow(file_path: str, query: str) -> GraphState:

    documents_tuple = document_loader.load_documents(file_path)
    documents, _ = documents_tuple

    chunker: Chunker = create_chunker(strategy="recursive")
    chunked_docs = chunker.chunk_documents(documents)

    # 3. Create the vector store with your embedding generator
    vector_store = create_vector_store(embedding_generator)

    # 4. Add the documents into the store
    vector_store.add_documents(chunked_docs)

    return GraphState(
        file_path=file_path,
        query=query,        
        documents=documents,
        chunks=chunked_docs,
        current_step="ingestion_completed"
    )
