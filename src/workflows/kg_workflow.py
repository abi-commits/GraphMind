from langgraph.graph import StateGraph, END
from src.workflows.state import GraphState
from src.workflows.node.document_processing import process_documents
from src.workflows.node.retrival import retrieve_relevant_context
from src.workflows.node.knowledge_graph import generate_knowledge_graph
from src.workflows.node.summarization import generate_summary
from src.config.logging import logging, GraphMindException


def decide_next_step(state: GraphState) -> str:
    """Main workflow to process documents, retrieve context, generate knowledge graph, and summarize"""
    
    if state.error:
        return "error"

    if state.current_step == "initializing":
        if state.file_path or state.documents:
            return "process_documents"
        elif state.query:
            return "retrieve_relevant_context"

    if state.current_step == "documents_processed" and state.query:
        return "retrieve_relevant_context"  
    
    if state.current_step == "context_retrieved":
        return "generate_knowledge_graph"
    
    if state.current_step == "knowledge_graph_generated":
        return "generate_summary"
    return "end"
    
def workflow_error(state: GraphState) -> GraphState:
    logging.error(f"Workflow encountered an error: {state.error}")
    return state

# Define the state graph
workflow = StateGraph(GraphState)

# Add nodes to the graph
workflow.add_node("process_documents", process_documents)
workflow.add_node("retrieve_relevant_context", retrieve_relevant_context)
workflow.add_node("generate_knowledge_graph", generate_knowledge_graph)
workflow.add_node("generate_summary", generate_summary)
workflow.add_node("error", workflow_error)

# Define graph structure
workflow.set_entry_point("process_documents")

# Add conditional edges
workflow.add_conditional_edges(
    "process_documents",
    decide_next_step,
    {
        "retrieve_relevant_context": "retrieve_relevant_context",
        "generate_knowledge_graph": "generate_knowledge_graph", 
        "error": "error",
        "end": END
    }
)

workflow.add_conditional_edges(
    "retrieve_relevant_context",
    decide_next_step,
    {
        "generate_knowledge_graph": "generate_knowledge_graph",
        "error": "error",
        "end": END
    }
)

workflow.add_conditional_edges(
    "generate_knowledge_graph",
    decide_next_step,
    {
        "generate_summary": "generate_summary",
        "error": "error", 
        "end": END
    }
)

workflow.add_conditional_edges(
    "generate_summary",
    decide_next_step,
    {
        "error": "error",
        "end": END
    }
)

workflow.add_edge("error", END)

# Compile the graph
kg_workflow = workflow.compile()

