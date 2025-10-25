from typing import List, Dict, Optional, Any
from src.components.data_ingestion.doc_loader import DocumentLoader
from src.components.processing.chunking import create_chunker
from src.services import get_vector_store
from src.workflows.state import GraphState
from src.config.logging import logging, GraphMindException


def process_documents(state: GraphState) -> GraphState:
    """Process documents: load, chunk, and store in vector database"""
    try:
        if state.file_path:
            document_loader = DocumentLoader()
            documents, _ = document_loader.load_documents(state.file_path)

            chunker = create_chunker()
            chunks = chunker.chunk_documents(documents)
            
            # Store chunks in vector database for later retrieval
            vector_store = get_vector_store()
            vector_store.add_documents(chunks)

            state_data = state.model_dump()
            state_data.update({
                "documents": documents,
                "chunks": chunks,
                "current_step": "documents_processed"
            })
            return GraphState(**state_data)
        return state
    except Exception as e:
        state_data = state.model_dump()
        state_data.update({"error": f"Document processing failed: {e}", "current_step": "error"})
        return GraphState(**state_data)