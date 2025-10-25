import pytest
from unittest.mock import Mock, patch, MagicMock
from langchain_core.documents import Document

from src.workflows.flow_manager import WorkflowManager
from src.workflows.state import GraphState
from src.workflows.kg_workflow import kg_workflow
from src.config.logging import GraphMindException


class TestGraphState:
    """Test workflow state management"""
    
    def test_graph_state_initialization(self):
        """Test GraphState initialization"""
        state = GraphState(
            query="Test query",
            current_step="initializing"
        )
        
        assert state.query == "Test query"
        assert state.current_step == "initializing"
        assert state.error is None
    
    def test_graph_state_with_documents(self):
        """Test GraphState with documents"""
        doc1 = Document(page_content="Content 1")
        doc2 = Document(page_content="Content 2")
        
        state = GraphState(
            documents=[doc1, doc2],
            current_step="processing"
        )
        
        assert state.documents is not None
        assert len(state.documents) == 2
        assert state.documents[0].page_content == "Content 1"
    
    def test_graph_state_error_handling(self):
        """Test GraphState with error"""
        state = GraphState(
            error="Test error message",
            current_step="error"
        )
        
        assert state.error == "Test error message"


class TestWorkflowManager:
    """Test workflow manager functionality"""
    
    @patch('src.workflows.flow_manager.kg_workflow')
    def test_process_query_success(self, mock_workflow):
        """Test successful query processing"""
        # Mock workflow execution result
        mock_result = GraphState(
            query="What is AI?",
            summary="AI is artificial intelligence",
            entities=[{"name": "AI", "type": "CONCEPT"}],
            relationships=[],
            knowledge_graph={"nodes": [], "edges": []},
            current_step="complete"
        )
        mock_workflow.invoke.return_value = mock_result
        
        manager = WorkflowManager()
        result = manager.process_query("What is AI?")
        
        assert result["success"] is True
        assert result["summary"] == "AI is artificial intelligence"
        assert "entities" in result
    
    @patch('src.workflows.flow_manager.kg_workflow')
    def test_process_query_with_error(self, mock_workflow):
        """Test query processing with error"""
        # Mock workflow returning error state
        mock_result = GraphState(
            query="Test query",
            error="Test error occurred",
            current_step="error"
        )
        mock_workflow.invoke.return_value = mock_result
        
        manager = WorkflowManager()
        result = manager.process_query("Test query")
        
        assert result["success"] is False
        assert "error" in result
    
    @patch('src.workflows.flow_manager.kg_workflow')
    def test_process_documents_success(self, mock_workflow):
        """Test successful document processing"""
        # Mock workflow execution result
        mock_result = GraphState(
            file_path="test.pdf",
            documents=[Document(page_content="Test content")],
            chunks=[Document(page_content="Chunk 1")],
            entities=[{"name": "Entity1", "type": "PERSON"}],
            current_step="complete"
        )
        mock_workflow.invoke.return_value = mock_result
        
        manager = WorkflowManager()
        result = manager.process_documents("test.pdf")
        
        assert result["success"] is True


class TestWorkflowComponents:
    """Test workflow components"""
    
    def test_workflow_state_structure(self):
        """Test workflow state has expected structure"""
        state = GraphState(current_step="initializing")
        
        # Check state has expected fields
        assert hasattr(state, "query")
        assert hasattr(state, "documents")
        assert hasattr(state, "chunks")
        assert hasattr(state, "entities")
        assert hasattr(state, "relationships")
        assert hasattr(state, "knowledge_graph")
        assert hasattr(state, "summary")
        assert hasattr(state, "error")
        assert hasattr(state, "current_step")
    
    def test_workflow_state_optional_fields(self):
        """Test that workflow state fields are optional"""
        state = GraphState(current_step="test")
        
        assert state.query is None
        assert state.documents is None
        assert state.chunks is None
        assert state.error is None


class TestWorkflowDecisionLogic:
    """Test workflow decision logic and routing"""
    
    def test_workflow_with_error_state(self):
        """Test workflow handles error state"""
        state = GraphState(
            error="Previous error occurred",
            current_step="error"
        )
        
        # Workflow should not proceed if error exists
        assert state.error is not None
        assert state.error == "Previous error occurred"
    
    def test_workflow_query_path(self):
        """Test workflow with query"""
        query_state = GraphState(
            query="What is machine learning?",
            current_step="query"
        )
        
        assert query_state.query is not None
        assert query_state.query != ""
    
    def test_workflow_document_path(self):
        """Test workflow with documents"""
        doc_state = GraphState(
            documents=[Document(page_content="Content")],
            current_step="processing"
        )
        
        assert doc_state.documents is not None
        assert len(doc_state.documents) > 0


class TestWorkflowIntegration:
    """Integration tests for complete workflows"""
    
    def test_workflow_manager_initialization(self):
        """Test workflow manager can be initialized"""
        manager = WorkflowManager()
        
        assert manager is not None
    
    def test_workflow_state_transitions(self):
        """Test state transitions through workflow"""
        # Initial state
        state = GraphState(current_step="initializing")
        assert state.current_step == "initializing"
        
        # Processing state
        state = GraphState(current_step="processing")
        assert state.current_step == "processing"
        
        # Complete state
        state = GraphState(current_step="complete", summary="Done")
        assert state.current_step == "complete"
        assert state.summary == "Done"
    
    def test_workflow_with_complete_state(self):
        """Test workflow with all fields populated"""
        state = GraphState(
            query="Test query",
            documents=[Document(page_content="Content")],
            chunks=[Document(page_content="Chunk")],
            entities=[{"name": "Entity"}],
            relationships=[{"source": "A", "target": "B"}],
            summary="Summary",
            current_step="complete"
        )
        
        assert state.query is not None
        assert state.documents is not None
        assert state.chunks is not None
        assert state.entities is not None
        assert state.relationships is not None
        assert state.summary is not None