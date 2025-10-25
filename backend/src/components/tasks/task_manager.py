from typing import Dict, Any, Optional
import uuid
from datetime import datetime
from src.components.tasks.redis_client import redis_client
from src.config.logging import logging, GraphMindException


class TaskManager:
    """Manages background tasks using Redis"""
    
    def __init__(self):
        self.redis_client = redis_client
    
    def create_task(self, task_data: Dict[str, Any]) -> str:
        """Create a new background task"""
        try:
            task_id = str(uuid.uuid4())
            
            task_info = {
                "task_id": task_id,
                "status": "pending",
                "progress": 0,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "request": task_data,
                "result": None,
                "error": None
            }
            
            # Store task in Redis with 1 hour TTL
            success = self.redis_client.set_task(task_id, task_info, ttl=3600)
            
            if not success:
                raise GraphMindException("Failed to store task in Redis")
            
            logging.info(f"Created background task {task_id}")
            return task_id
            
        except Exception as e:
            logging.error(f"Error creating task: {e}")
            raise GraphMindException(f"Task creation failed: {e}")
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status from Redis"""
        try:
            task_data = self.redis_client.get_task(task_id)
            if not task_data:
                return None
            
            # Convert datetime strings back to datetime objects for API response
            if "created_at" in task_data:
                try:
                    task_data["created_at"] = datetime.fromisoformat(task_data["created_at"])
                except ValueError:
                    pass
            
            if "updated_at" in task_data:
                try:
                    task_data["updated_at"] = datetime.fromisoformat(task_data["updated_at"])
                except ValueError:
                    pass
            
            return task_data
            
        except Exception as e:
            logging.error(f"Error getting task status {task_id}: {e}")
            return None
    
    def update_task_progress(self, task_id: str, progress: float, message: Optional[str] = None) -> bool:
        """Update task progress"""
        try:
            kwargs: Dict[str, Any] = {"progress": progress}
            if message:
                kwargs["message"] = message
            
            return self.redis_client.update_task_status(task_id, "processing", **kwargs)
            
        except Exception as e:
            logging.error(f"Error updating task progress {task_id}: {e}")
            return False
    
    def mark_task_completed(self, task_id: str, result: Dict[str, Any]) -> bool:
        """Mark task as completed with result"""
        try:
            return self.redis_client.update_task_status(
                task_id, 
                "completed", 
                result=result, 
                progress=100,
                completed_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logging.error(f"Error marking task completed {task_id}: {e}")
            return False
    
    def mark_task_failed(self, task_id: str, error: str) -> bool:
        """Mark task as failed with error"""
        try:
            return self.redis_client.update_task_status(
                task_id, 
                "failed", 
                error=error,
                completed_at=datetime.now().isoformat()
            )
            
        except Exception as e:
            logging.error(f"Error marking task failed {task_id}: {e}")
            return False
    
    def start_task_processing(self, task_id: str) -> bool:
        """Mark task as started"""
        try:
            return self.redis_client.update_task_status(
                task_id, 
                "processing", 
                started_at=datetime.now().isoformat(),
                progress=0
            )
            
        except Exception as e:
            logging.error(f"Error starting task {task_id}: {e}")
            return False
    
    def get_all_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Get all tasks"""
        try:
            return self.redis_client.get_all_tasks()
        except Exception as e:
            logging.error(f"Error getting all tasks: {e}")
            return {}
    
    def cleanup_old_tasks(self, hours: int = 24) -> int:
        """Clean up old completed/failed tasks"""
        try:
            return self.redis_client.cleanup_completed_tasks(hours)
        except Exception as e:
            logging.error(f"Error cleaning up tasks: {e}")
            return 0
    
    def health_check(self) -> Dict[str, Any]:
        """Check task manager health"""
        try:
            redis_health = self.redis_client.health_check()
            tasks = self.get_all_tasks()
            
            task_counts = {
                "pending": 0,
                "processing": 0,
                "completed": 0,
                "failed": 0
            }
            
            for task_data in tasks.values():
                status = task_data.get("status", "unknown")
                if status in task_counts:
                    task_counts[status] += 1
            
            return {
                "status": "healthy" if redis_health["status"] == "healthy" else "unhealthy",
                "redis": redis_health,
                "task_counts": task_counts,
                "total_tasks": len(tasks)
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Singleton instance
task_manager = TaskManager()