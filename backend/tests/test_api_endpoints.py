import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from src.api.routes import router

# Create test app
app = FastAPI()
app.include_router(router)


class TestHealthEndpoint:
    """Test /health endpoint"""
    
    @patch('src.components.processing.vector_store.create_vector_store')
    @patch('src.components.processing.embeddings.EmbeddingGenerator')
    def test_health_check_success(self, mock_embedding_gen, mock_vector_store):
        """Test successful health check"""
        # Mock vector store health check
        mock_vs_instance = Mock()
        mock_vs_instance.health_check.return_value = {"status": "healthy"}
        mock_vector_store.return_value = mock_vs_instance
        mock_embedding_gen.return_value = Mock()
        
        client = TestClient(app)
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "components" in data


class TestQueryEndpoint:
    """Test /query endpoint - the main query processing function"""
    
    @patch('src.api.routes.workflow_manager')
    def test_query_success(self, mock_workflow_manager):
        """Test successful query processing"""
        mock_workflow_manager.process_query.return_value = {
            "success": True,
            "summary": "This is a test summary",
            "entities": [{"name": "AI", "type": "CONCEPT"}],
            "relationships": []
        }
        
        client = TestClient(app)
        response = client.post(
            "/query",
            json={"query": "What is AI?"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["summary"] == "This is a test summary"
    
    @patch('src.api.routes.workflow_manager')
    def test_query_validation_error(self, mock_workflow_manager):
        """Test query with invalid input"""
        client = TestClient(app)
        
        # Empty query string should fail validation
        response = client.post(
            "/query",
            json={"query": ""}
        )
        
        assert response.status_code == 422  # Validation error


class TestDocumentProcessEndpoint:
    """Test /documents/process endpoint - the main document processing function"""
    
    @patch('src.api.routes.workflow_manager')
    def test_process_document_sync_success(self, mock_workflow_manager):
        """Test successful synchronous document processing"""
        mock_workflow_manager.process_documents.return_value = {
            "success": True,
            "documents_processed": 1,
            "chunks_created": 10
        }
        
        client = TestClient(app)
        response = client.post(
            "/documents/process",
            json={
                "file_path": "/path/to/document.pdf",
                "process_in_background": False
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["message"] == "Document processed successfully"
    
    @patch('src.api.routes.workflow_manager')
    def test_process_document_background(self, mock_workflow_manager):
        """Test background document processing"""
        client = TestClient(app)
        response = client.post(
            "/documents/process",
            json={
                "file_path": "/path/to/document.pdf",
                "process_in_background": True
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "task_id" in data
        assert data["message"] == "Document processing started in background"


class TestTaskStatusEndpoint:
    """Test /tasks/{task_id} endpoint"""
    
    def test_get_task_status_not_found(self):
        """Test getting status for non-existent task"""
        client = TestClient(app)
        response = client.get("/tasks/non-existent-task-id")
        
        assert response.status_code == 404


class TestDocumentStatsEndpoint:
    """Test /documents/stats endpoint"""
    
    @patch('src.components.processing.vector_store.create_vector_store')
    @patch('src.components.processing.embeddings.EmbeddingGenerator')
    def test_get_document_stats_success(self, mock_embedding_gen, mock_vector_store):
        """Test getting document statistics"""
        mock_vs_instance = Mock()
        mock_vs_instance.get_collection_stats.return_value = {
            "count": 50,
            "metadata": {"collection": "graphmind"}
        }
        mock_vector_store.return_value = mock_vs_instance
        mock_embedding_gen.return_value = Mock()
        
        client = TestClient(app)
        response = client.get("/documents/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "total_documents" in data