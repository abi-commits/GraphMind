from typing import List, Dict, Optional, Any
from src.components.processing.vector_store import create_vector_store
from src.components.processing.embeddings import EmbeddingGenerator
from src.workflows.state import GraphState
from src.config.logging import logging, GraphMindException

def retrieve_relevant_context(state: GraphState) -> GraphState:
    """Retrieve relevant context from vector store based on query"""
    try:
        if state.query:
            embedding_generator = EmbeddingGenerator()
            vector_store = create_vector_store(embedding_generator)

            relevant_chunks = vector_store.query(state.query, top_k=5)
            combined_context = "\n\n".join([chunk.page_content for chunk in relevant_chunks])

            state_data = state.model_dump()
            state_data.update({
                "relevant_chunks": relevant_chunks,
                "combined_context": combined_context,
                "current_step": "context_retrieved"
            })
            return GraphState(**state_data)
        return state
    except Exception as e:
        state_data = state.model_dump()
        state_data.update({"error": f"Context retrieval failed: {e}", "current_step": "error"})
        return GraphState(**state_data)