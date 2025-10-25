from langgraph.graph import StateGraph, END
from src.workflows.state import GraphState
from src.components.data_ingestion.doc_loader import DocumentLoader
from src.components.processing.chunking import create_chunker, Chunker
from src.services import get_vector_store
from src.config.settings import settings
from src.config.logging import logging, GraphMindException

def ingestion_workflow(file_path: str, query: str) -> GraphState:
    """Process documents and store them in the vector database."""
    
    document_loader = DocumentLoader()
    documents_tuple = document_loader.load_documents(file_path)
    documents, _ = documents_tuple

    chunker: Chunker = create_chunker(strategy="recursive")
    chunked_docs = chunker.chunk_documents(documents)

    # Use singleton vector store to add documents
    vector_store = get_vector_store()
    vector_store.add_documents(chunked_docs)

    return GraphState(
        file_path=file_path,
        query=query,        
        documents=documents,
        chunks=chunked_docs,
        current_step="documents_processed"  # Fixed: align with kg_workflow expectations
    )
