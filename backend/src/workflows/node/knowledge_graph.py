from typing import Dict, Any
from langgraph.graph import StateGraph, END
from src.components.knowledge_graph.orchestrator import GraphOrchestrator
from src.workflows.state import GraphState
from src.config.logging import logging


def generate_knowledge_graph(state: GraphState) -> GraphState:
    """Generate knowledge graph from content"""
    try:
        if state.combined_context:
            kg_orchestrator = GraphOrchestrator()
            kg_result = kg_orchestrator.build_graph_from_text(state.combined_context)

            state_data = state.model_dump()
            state_data.update({
                "entities": kg_result.get("entities", []),
                "relationships": kg_result.get("relationships", []),
                "knowledge_graph": kg_result,
                "visualizations_data": kg_result.get("visualization", {}),
                "current_step": "knowledge_graph_generated"
            })
            return GraphState(**state_data)
        else:
            # No context to build knowledge graph from, mark as completed with empty results
            state_data = state.model_dump()
            state_data.update({
                "entities": [],
                "relationships": [],
                "knowledge_graph": {"nodes": [], "edges": []},
                "visualizations_data": {},
                "current_step": "knowledge_graph_generated"
            })
            return GraphState(**state_data)
    except Exception as e:
        state_data = state.model_dump()
        state_data.update({"error": f"Knowledge graph generation failed: {e}", "current_step": "error"})
        return GraphState(**state_data)