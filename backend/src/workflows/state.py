from typing import List, Dict, Optional, Any
from langchain_core.documents import Document
from pydantic import BaseModel

class GraphState(BaseModel):
    """State for the GraphMind workflow"""
    
    #Input
    query: Optional[str] = None
    documents: Optional[List[Document]] = None
    file_path: Optional[str] = None

    #processing
    chunks: Optional[List[Document]] = None
    relevant_chunks: Optional[List[Document]] = None
    combined_context: Optional[str] = None

    #Knowledge Graph
    entities: Optional[List[Dict[str, Any]]] = None
    relationships: Optional[List[Dict[str, Any]]] = None
    knowledge_graph: Optional[Dict[str, Any]] = None

    #Output
    summary: Optional[str] = None
    visualizations_data: Optional[Dict[str, Any]] = None

    #Control flow
    error: Optional[str] = None
    current_step: str = "initializing"