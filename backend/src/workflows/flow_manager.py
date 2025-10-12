from typing import Dict, Any, Optional, cast
from langchain.schema import Document
from src.workflows.kg_workflow import kg_workflow
from src.workflows.state import GraphState
from src.config.logging import GraphMindException, logging

class WorkflowManager:
    def __init__(self):
        self.workflow = kg_workflow
    
    def process_query(self, query: str, file_path: Optional[str] = None, ) -> Dict[str, Any]:
        """Process a query through the complete workflow"""
        try:
            # Initialize state
            initial_state = GraphState(query=query, file_path=file_path)
            
            # Execute workflow
            result = self.workflow.invoke(initial_state)
            
            if result is None:
                raise GraphMindException("Workflow returned None - workflow execution failed")
            
            # Check if result is a dict (error case) or GraphState
            if isinstance(result, dict):
                if result.get("error"):
                    raise GraphMindException(f"Workflow failed: {result.get('error')}")
                # Convert dict to GraphState if needed
                final_state = GraphState(**result)
            else:
                final_state = cast(GraphState, result)

            if hasattr(final_state, 'error') and final_state.error:
                raise GraphMindException(f"Workflow failed: {final_state.error}")
            
            return {
                "success": True,
                "summary": final_state.summary,
                "knowledge_graph": final_state.knowledge_graph,
                "visualization_data": final_state.visualizations_data,
                "entities": final_state.entities,
                "relationships": final_state.relationships,
                "processing_steps": [final_state.current_step] if final_state.current_step else []
            }
            
        except Exception as e:
            logging.error(f"Workflow execution failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "summary": None,
                "knowledge_graph": None
            }
    
    def process_documents(self, file_path: str) -> Dict[str, Any]:
        """Process documents through the workflow"""
        try:
            initial_state = GraphState(file_path=file_path)
            result = self.workflow.invoke(initial_state)
            
            if result is None:
                raise GraphMindException("Workflow returned None - workflow execution failed")
            
            # Check if result is a dict (error case) or GraphState
            if isinstance(result, dict):
                if result.get("error"):
                    raise GraphMindException(f"Workflow failed: {result.get('error')}")
                # Convert dict to GraphState if needed
                final_state = GraphState(**result)
            else:
                final_state = cast(GraphState, result)
            
            if hasattr(final_state, 'error') and final_state.error:
                raise GraphMindException(f"Document processing failed: {final_state.error}")
            
            return {
                "success": True,
                "documents_processed": len(final_state.documents or []),
                "chunks_created": len(final_state.chunks or []),
                "processing_steps": [final_state.current_step] if final_state.current_step else []
            }
            
        except Exception as e:
            logging.error(f"Document processing workflow failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }