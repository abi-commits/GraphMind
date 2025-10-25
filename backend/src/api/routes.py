from fastapi import APIRouter, HTTPException, BackgroundTasks, status, UploadFile, File
from typing import Dict, Any
import time
import os
import uuid
import requests
import tempfile
import shutil
from datetime import datetime
from pathlib import Path

from src.api.models import (
    QueryRequest, DocumentProcessRequest, QueryResponse, DocumentProcessResponse,
    HealthResponse, TaskStatusResponse
)
from src.workflows.flow_manager import WorkflowManager
from src.components.tasks.task_manager import task_manager
from src.config.aws_config import s3_client
from src.config.settings import settings
from src.config.logging import logging

router = APIRouter()
workflow_manager = WorkflowManager()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Lightweight health check endpoint"""
    components = {"api": "healthy"}
    overall_status = "healthy"
    
    # Quick Redis check via task manager
    try:
        task_manager_health = task_manager.health_check()
        components["task_manager"] = task_manager_health["status"]
        components["redis"] = task_manager_health.get("redis", {}).get("status", "unknown")
    except Exception:
        components["task_manager"] = "unhealthy"
        components["redis"] = "unhealthy"
        overall_status = "degraded"
    
    # Basic workflow manager check (just instantiation)
    try:
        components["workflow_manager"] = "healthy"
    except Exception:
        components["workflow_manager"] = "unhealthy"
        overall_status = "degraded"
    
    # Set overall status based on critical components
    if components.get("redis") == "unhealthy":
        overall_status = "degraded"
    
    return HealthResponse(
        status=overall_status,
        version="1.0.0",
        timestamp=datetime.now(),
        components=components
    )


@router.get("/ready")
async def readiness_check():
    """Simple readiness check for container orchestration"""
    try:
        # Quick Redis connectivity check
        task_manager_health = task_manager.health_check()
        redis_status = task_manager_health.get("redis", {}).get("status", "unknown")
        
        if redis_status == "healthy":
            return {"status": "ready"}
        else:
            raise HTTPException(status_code=503, detail="Service not ready")
    except Exception:
        raise HTTPException(status_code=503, detail="Service not ready")

@router.post("/documents/upload")
async def upload_document(file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    """Upload a document to S3 storage"""
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must have a filename"
            )
        
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{file_extension}' not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}"
            )
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum limit of {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        if len(file_content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        # Generate unique S3 key
        file_id = str(uuid.uuid4())
        s3_key = f"documents/{file_id}/{file.filename}"
        
        # Upload to S3
        from io import BytesIO
        file_obj = BytesIO(file_content)
        s3_url = s3_client.upload_fileobj(
            file_obj, 
            s3_key, 
            content_type=file.content_type or 'application/octet-stream'
        )
        
        # Generate presigned URL for immediate access
        presigned_url = s3_client.generate_presigned_url(s3_key, expiration=3600)
        
        # Automatically trigger document processing after upload
        task_data = {
            "s3_key": s3_key,
            "chunk_size": settings.CHUNK_SIZE,
            "chunk_overlap": settings.CHUNK_OVERLAP,
            "filename": file.filename,
            "auto_processed": True
        }
        
        task_id = task_manager.create_task(task_data)
        
        # Add background processing task
        background_tasks.add_task(
            _process_document_background,
            task_id, s3_key, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP
        )
        
        return {
            "success": True,
            "message": "File uploaded and processing started automatically",
            "s3_url": s3_url,
            "s3_key": s3_key,
            "presigned_url": presigned_url,
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(file_content),
            "task_id": task_id,
            "processing_status": "started"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}")

@router.delete("/documents/{s3_key:path}")
async def delete_document(s3_key: str):
    """Delete a document from S3 storage"""
    try:
        success = s3_client.delete_file(s3_key)
        if success:
            return {
                "success": True,
                "message": f"Document {s3_key} deleted successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {s3_key} not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Delete failed: {str(e)}")

@router.get("/documents/url/{s3_key:path}")
async def get_document_url(s3_key: str, expiration: int = 3600):
    """Get a presigned URL for a document"""
    try:
        if not s3_client.file_exists(s3_key):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {s3_key} not found"
            )
        
        presigned_url = s3_client.generate_presigned_url(s3_key, expiration=expiration)
        
        return {
            "success": True,
            "url": presigned_url,
            "expires_in": expiration
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get document URL: {str(e)}")

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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query processing failed: {str(e)}")
        

def _process_document_background(task_id: str, s3_key: str, chunk_size: int, chunk_overlap: int):
    """Background task for document processing"""
    try:
        # Mark task as started
        task_manager.start_task_processing(task_id)
        
        # Update progress
        task_manager.update_task_progress(task_id, 10, "Starting document processing...")
        
        # Download file from S3 to temporary location
        task_manager.update_task_progress(task_id, 20, "Downloading file from S3...")
        
        temp_dir = Path(tempfile.mkdtemp())
        filename = s3_key.split('/')[-1]
        temp_file_path = temp_dir / filename
        
        logging.info(f"Downloading S3 file: {s3_key} to {temp_file_path}")
        
        # Get presigned URL and download
        presigned_url = s3_client.generate_presigned_url(s3_key, expiration=3600)
        
        logging.info(f"Generated presigned URL for download")
        
        response = requests.get(presigned_url)
        response.raise_for_status()
        
        logging.info(f"Downloaded {len(response.content)} bytes")
        
        with open(temp_file_path, 'wb') as f:
            f.write(response.content)
        
        logging.info(f"File saved to {temp_file_path}")
        
        task_manager.update_task_progress(task_id, 30, "File downloaded, processing document...")
        
        # Process the document
        result = workflow_manager.process_documents(str(temp_file_path))
        
        # Add S3 key to result
        if result.get("success"):
            result["s3_key"] = s3_key
        
        # Clean up temp file
        shutil.rmtree(temp_dir, ignore_errors=True)
        
        # Mark as completed
        task_manager.mark_task_completed(task_id, result)
        
    except Exception as e:
        # Mark as failed
        task_manager.mark_task_failed(task_id, str(e))
        logging.exception(f"Background task {task_id} failed")

@router.post("/documents/process", response_model=DocumentProcessResponse)
async def process_document(request: DocumentProcessRequest, background_tasks_manager: BackgroundTasks):
    """Endpoint to process a document through the workflow."""
    start_time = time.time()
    
    try:
        if request.process_in_background:
            # Create background task using task manager
            task_data = {
                "s3_key": request.s3_key,
                "chunk_size": request.chunk_size,
                "chunk_overlap": request.chunk_overlap,
                "request": request.model_dump()
            }
            
            task_id = task_manager.create_task(task_data)
            
            # Add to background tasks
            background_tasks_manager.add_task(
                _process_document_background,
                task_id, request.s3_key, request.chunk_size, request.chunk_overlap
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
            # Process synchronously - download from S3 first
            temp_dir = Path(tempfile.mkdtemp())
            filename = request.s3_key.split('/')[-1]
            temp_file_path = temp_dir / filename
            
            # Download file from S3
            presigned_url = s3_client.generate_presigned_url(request.s3_key, expiration=3600)
            
            response = requests.get(presigned_url)
            response.raise_for_status()
            
            with open(temp_file_path, 'wb') as f:
                f.write(response.content)
            
            # Process the document
            result = workflow_manager.process_documents(str(temp_file_path))
            
            # Add S3 key to result
            if result.get("success"):
                result["s3_key"] = request.s3_key
            
            # Clean up temp file
            shutil.rmtree(temp_dir, ignore_errors=True)
            
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
    task_data = task_manager.get_task_status(task_id)
    
    if not task_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )
    
    return TaskStatusResponse(
        task_id=task_id,
        status=task_data["status"],
        progress=task_data.get("progress"),
        result=task_data.get("result"),
        error=task_data.get("error"),
        created_at=task_data["created_at"],
        updated_at=task_data.get("updated_at", task_data["created_at"])
    )

@router.get("/documents/stats")
async def get_documents_stats():
    """Get statistics about processed documents"""
    try:
        from src.services import get_vector_store
        
        vector_store = get_vector_store()
        stats = vector_store.get_collection_stats()
        
        # Get task statistics
        task_health = task_manager.health_check()
        
        return {
            "success": True,
            "total_documents": stats.get("count", 0),
            "collection_metadata": stats.get("metadata", {}),
            "task_statistics": task_health.get("task_counts", {}),
            "total_tasks": task_health.get("total_tasks", 0)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get document stats: {str(e)}"
        )

@router.get("/tasks")
async def get_all_tasks():
    """Get all background tasks"""
    try:
        tasks = task_manager.get_all_tasks()
        return {
            "success": True,
            "tasks": tasks,
            "total": len(tasks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tasks: {str(e)}"
        )

@router.delete("/tasks/cleanup")
async def cleanup_old_tasks(hours: int = 24):
    """Clean up completed/failed tasks older than specified hours"""
    try:
        deleted_count = task_manager.cleanup_old_tasks(hours)
        return {
            "success": True,
            "message": f"Cleaned up {deleted_count} old tasks",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup tasks: {str(e)}"
        )

@router.get("/documents/upload-status/{task_id}")
async def get_upload_status(task_id: str):
    """Get the processing status of an uploaded document"""
    try:
        task_data = task_manager.get_task_status(task_id)
        
        if not task_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Upload task {task_id} not found"
            )
        
        # Get vector store stats to show document count
        from src.services import get_vector_store
        vector_store = get_vector_store()
        stats = vector_store.get_collection_stats()
        
        return {
            "task_id": task_id,
            "status": task_data["status"],
            "progress": task_data.get("progress"),
            "result": task_data.get("result"),
            "error": task_data.get("error"),
            "created_at": task_data["created_at"],
            "updated_at": task_data.get("updated_at", task_data["created_at"]),
            "vector_db_count": stats.get("count", 0),
            "ready_for_queries": task_data["status"] == "completed"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get upload status: {str(e)}"
        )