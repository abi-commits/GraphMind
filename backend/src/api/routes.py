from fastapi import APIRouter, HTTPException, BackgroundTasks, status
from typing import Dict, Any
import uuid
import time
from datetime import datetime

from src.api.models import (
    QueryRequest, DocumentProcessRequest, QueryResponse, DocumentProcessResponse,
    HealthResponse, TaskStatusResponse
)
from src.workflows.flow_manager import WorkflowManager

router = APIRouter()
workflow_manager = WorkflowManager()

# In-memory storage for background tasks (use Redis in production)
background_tasks: Dict[str, Dict[str, Any]] = {}

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check vector store health
        from src.components.processing.vector_store import create_vector_store
        from src.components.processing.embeddings import EmbeddingGenerator
        
        embedding_generator = EmbeddingGenerator()
        vector_store = create_vector_store(embedding_generator)
        vector_store_health = "healthy" if vector_store.health_check().get("status") == "healthy" else "unhealthy"
        
        return HealthResponse(
            status="healthy",
            version="1.0.0",
            timestamp=datetime.now(),
            components={
                "vector_store": vector_store_health,
                "workflow_manager": "healthy",
                "api": "healthy"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

@router.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Endpoint to process a query through the workflow."""
    start_time = time.time()
    
    try:
        response = workflow_manager.process_query(
            query=request.query,
            file_path=request.file_path,
        )
        
        processing_time = time.time() - start_time
        
        if not response["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Query processing failed: {response.get('error')}")
        
        return QueryResponse(
            success=True,
            summary=response.get("summary"),
            knowledge_graph=response.get("knowledge_graph"),
            entities=response.get("entities"),
            relationships=response.get("relationships"),
            visualization_data=response.get("visualization_data"),
            relevant_chunks=response.get("relevant_chunks"),
            processing_steps=response.get("processing_steps"),
            processing_time=processing_time,
            error=None
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        

def _process_document_background(task_id: str, file_path: str, chunk_size: int, chunk_overlap: int):
    """Background task for document processing"""
    try:
        background_tasks[task_id].update({
            "status": "processing",
            "started_at": datetime.now()
        })
        
        # Process the document
        result = workflow_manager.process_documents(file_path)
        
        background_tasks[task_id].update({
            "status": "completed",
            "result": result,
            "completed_at": datetime.now(),
            "progress": 100
        })
        
    except Exception as e:
        background_tasks[task_id].update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.now()
        })

@router.post("/documents/process", response_model=DocumentProcessResponse)
async def process_document(request: DocumentProcessRequest, background_tasks_manager: BackgroundTasks):
    """Endpoint to process a document through the workflow."""
    start_time = time.time()
    
    try:
        if request.process_in_background:
            # Create background task
            task_id = str(uuid.uuid4())
            background_tasks[task_id] = {
                "status": "pending",
                "request": request.model_dump(),
                "created_at": datetime.now(),
                "progress": 0
            }
            
            # Add to background tasks
            background_tasks_manager.add_task(
                _process_document_background,
                task_id, request.file_path, request.chunk_size, request.chunk_overlap
            )
            
            processing_time = time.time() - start_time
            
            return DocumentProcessResponse(
                success=True,
                message="Document processing started in background",
                task_id=task_id,
                processing_time=processing_time,
                document_name=None,
                documents_processed=None,
                chunks_created=None,
                processing_steps=None,
                error=None
            )
        else:
            # Process synchronously
            result = workflow_manager.process_documents(request.file_path)
            processing_time = time.time() - start_time
            
            if not result["success"]:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Document processing failed: {result.get('error', 'Unknown error')}")
            
            return DocumentProcessResponse(
                success=True,
                message="Document processed successfully",
                document_name=result.get("document_name"),
                documents_processed=result.get("documents_processed"),
                chunks_created=result.get("chunks_created"),
                processing_steps=result.get("processing_steps"),
                processing_time=processing_time,
                task_id=None,
                error=None
            )
            
    except Exception as e:
        processing_time = time.time() - start_time
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(e)}")

@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Get status of a background task"""
    if task_id not in background_tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )
    
    task = background_tasks[task_id]
    
    return TaskStatusResponse(
        task_id=task_id,
        status=task["status"],
        progress=task.get("progress"),
        result=task.get("result"),
        error=task.get("error"),
        created_at=task["created_at"],
        updated_at=task.get("updated_at", task["created_at"])
    )

@router.get("/documents/stats")
async def get_documents_stats():
    """Get statistics about processed documents"""
    try:
        from src.components.processing.vector_store import create_vector_store
        from src.components.processing.embeddings import EmbeddingGenerator
        
        embedding_generator = EmbeddingGenerator()
        vector_store = create_vector_store(embedding_generator)
        stats = vector_store.get_collection_stats()
        
        return {
            "success": True,
            "total_documents": stats.get("count", 0),
            "collection_metadata": stats.get("metadata", {}),
            "background_tasks": len(background_tasks)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get document stats: {str(e)}"
        )