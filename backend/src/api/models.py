from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Request Models
class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, description="The query to search for in the documents")
    top_k: int = Field(5, ge=1, le=20, description="Number of top results to return")
    include_summary: bool = Field(True, description="Include AI-generated summary")
    include_knowledge_graph: bool = Field(True, description="Include knowledge graph extraction")
    file_path: Optional[str] = Field(None, description="Optional specific file to query")

class DocumentProcessRequest(BaseModel):
    s3_key: str = Field(..., description="S3 key of the document to process")
    chunk_size: int = Field(1000, ge=100, le=5000, description="Size of text chunks")
    chunk_overlap: int = Field(200, ge=0, le=1000, description="Overlap between chunks")
    process_in_background: bool = Field(True, description="Process in background or synchronously")

# Response Models
class QueryResponse(BaseModel):
    success: bool = Field(..., description="Indicates if the query workflow was successful")
    summary: Optional[str] = Field(None, description="Generated summary")
    knowledge_graph: Optional[Dict[str, Any]] = Field(None, description="Generated knowledge graph")
    entities: Optional[List[Dict[str, Any]]] = Field(None, description="Extracted entities")
    relationships: Optional[List[Dict[str, Any]]] = Field(None, description="Extracted relationships")
    visualization_data: Optional[Dict[str, Any]] = Field(None, description="Visualization data for the graph")
    relevant_chunks: Optional[List[Dict[str, Any]]] = Field(None, description="Relevant text chunks found")
    processing_steps: Optional[List[str]] = Field(None, description="Steps completed in the workflow")
    processing_time: Optional[float] = Field(None, description="Time taken to process the query in seconds")
    error: Optional[str] = Field(None, description="Error message, if any")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

class DocumentProcessResponse(BaseModel):
    success: bool = Field(..., description="Indicates if document processing was successful")
    message: str = Field(..., description="Processing status message")
    document_name: Optional[str] = Field(None, description="Name of the processed document")
    documents_processed: Optional[int] = Field(None, description="Number of documents processed")
    chunks_created: Optional[int] = Field(None, description="Number of chunks created")
    processing_time: Optional[float] = Field(None, description="Time taken to process in seconds")
    processing_steps: Optional[List[str]] = Field(None, description="Steps completed in the workflow")
    task_id: Optional[str] = Field(None, description="Background task ID if processed asynchronously")
    error: Optional[str] = Field(None, description="Error message, if any")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

# Health and Status Models
class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(..., description="Current server time")
    components: Dict[str, str] = Field(..., description="Status of individual components")

class TaskStatusResponse(BaseModel):
    task_id: str = Field(..., description="Task identifier")
    status: str = Field(..., description="Current task status")
    progress: Optional[float] = Field(None, ge=0, le=100, description="Progress percentage")
    result: Optional[Dict[str, Any]] = Field(None, description="Task result when completed")
    error: Optional[str] = Field(None, description="Error message if task failed")
    created_at: datetime = Field(..., description="Task creation time")
    updated_at: datetime = Field(..., description="Last update time")