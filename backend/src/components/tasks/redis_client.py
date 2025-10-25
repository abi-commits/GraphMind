import redis
import json
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from src.config.settings import settings
from src.config.logging import logging, GraphMindException


class RedisClient:
    """Redis client for task management and caching"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._connect()
    
    def _connect(self):
        """Initialize Redis connection with proper error handling"""
        try:
            connection_params = {
                "host": settings.REDIS_HOST,
                "port": settings.REDIS_PORT,
                "db": settings.REDIS_DB,
                "decode_responses": True,
                "socket_connect_timeout": 5,
                "socket_timeout": 5,
                "retry_on_timeout": True,
                "health_check_interval": 30
            }
            
            # Only add password if it's set and not empty
            if hasattr(settings, 'REDIS_PASSWORD') and settings.REDIS_PASSWORD:
                connection_params["password"] = settings.REDIS_PASSWORD
            
            self.redis_client = redis.Redis(**connection_params)
            
            # Test connection
            self.redis_client.ping()
            logging.info(f"Successfully connected to Redis at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
            
        except redis.ConnectionError as e:
            logging.error(f"Redis connection error: {e}")
            self.redis_client = None
        except Exception as e:
            logging.error(f"Unexpected Redis error: {e}")
            self.redis_client = None
    
    def _ensure_connection(self) -> bool:
        """Ensure Redis connection is available"""
        if self.redis_client is None:
            self._connect()
        return self.redis_client is not None
    
    def set_task(self, task_id: str, task_data: Dict[str, Any], ttl: int = 3600) -> bool:
        """Store task data in Redis with TTL"""
        if not self._ensure_connection() or self.redis_client is None:
            logging.warning("Redis not available, cannot store task")
            return False
            
        try:
            # Add timestamp
            task_data_copy = task_data.copy()
            task_data_copy["updated_at"] = datetime.now().isoformat()
            
            key = f"task:{task_id}"
            result = self.redis_client.setex(key, ttl, json.dumps(task_data_copy, default=str))
            if result:
                logging.info(f"Stored task {task_id} in Redis")
                return True
            return False
        except Exception as e:
            logging.error(f"Error storing task {task_id}: {e}")
            return False
    
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve task data from Redis"""
        if not self._ensure_connection() or self.redis_client is None:
            logging.warning("Redis not available, cannot retrieve task")
            return None
            
        try:
            key = f"task:{task_id}"
            data = self.redis_client.get(key)
            if data and isinstance(data, str):
                return json.loads(data)
            return None
        except Exception as e:
            logging.error(f"Error retrieving task {task_id}: {e}")
            return None
    
    def update_task_status(self, task_id: str, status: str, **kwargs) -> bool:
        """Update task status and additional fields"""
        if not self._ensure_connection():
            logging.warning("Redis not available, cannot update task status")
            return False
            
        try:
            task_data = self.get_task(task_id)
            if not task_data:
                logging.warning(f"Task {task_id} not found for status update")
                return False
            
            task_data["status"] = status
            task_data["updated_at"] = datetime.now().isoformat()
            
            # Update additional fields
            for key, value in kwargs.items():
                task_data[key] = value
            
            return self.set_task(task_id, task_data)
        except Exception as e:
            logging.error(f"Error updating task {task_id}: {e}")
            return False
    
    def delete_task(self, task_id: str) -> bool:
        """Delete task from Redis"""
        if not self._ensure_connection() or self.redis_client is None:
            logging.warning("Redis not available, cannot delete task")
            return False
            
        try:
            key = f"task:{task_id}"
            result = self.redis_client.delete(key)
            if result:
                logging.info(f"Deleted task {task_id} from Redis")
                return True
            return False
        except Exception as e:
            logging.error(f"Error deleting task {task_id}: {e}")
            return False
    
    def get_all_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Get all tasks from Redis"""
        if not self._ensure_connection() or self.redis_client is None:
            logging.warning("Redis not available, cannot retrieve all tasks")
            return {}
            
        try:
            keys = self.redis_client.keys("task:*")
            tasks = {}
            if keys and isinstance(keys, list):
                for key in keys:
                    if isinstance(key, str):
                        task_id = key.replace("task:", "")
                        task_data = self.get_task(task_id)
                        if task_data:
                            tasks[task_id] = task_data
            return tasks
        except Exception as e:
            logging.error(f"Error retrieving all tasks: {e}")
            return {}
    
    def cleanup_completed_tasks(self, older_than_hours: int = 24) -> int:
        """Clean up completed tasks older than specified hours"""
        if not self._ensure_connection():
            logging.warning("Redis not available, cannot cleanup tasks")
            return 0
            
        try:
            cutoff_time = datetime.now() - timedelta(hours=older_than_hours)
            tasks = self.get_all_tasks()
            deleted_count = 0
            
            for task_id, task_data in tasks.items():
                if task_data.get("status") in ["completed", "failed"]:
                    updated_at = task_data.get("updated_at")
                    if updated_at:
                        try:
                            # Handle different datetime formats
                            updated_at_clean = updated_at.replace('Z', '+00:00')
                            task_time = datetime.fromisoformat(updated_at_clean)
                            if task_time < cutoff_time:
                                if self.delete_task(task_id):
                                    deleted_count += 1
                        except (ValueError, TypeError):
                            # Skip tasks with invalid timestamps
                            continue
            
            logging.info(f"Cleaned up {deleted_count} completed tasks")
            return deleted_count
        except Exception as e:
            logging.error(f"Error cleaning up tasks: {e}")
            return 0
    
    def health_check(self) -> Dict[str, Any]:
        """Check Redis health"""
        if not self._ensure_connection() or self.redis_client is None:
            return {
                "status": "unhealthy",
                "error": "Redis connection not available"
            }
            
        try:
            # Test basic connectivity
            self.redis_client.ping()
            
            # Get Redis info
            info = self.redis_client.info()
            if isinstance(info, dict):
                return {
                    "status": "healthy",
                    "connected_clients": info.get("connected_clients", 0),
                    "used_memory": info.get("used_memory_human", "unknown"),
                    "uptime": info.get("uptime_in_seconds", 0)
                }
            else:
                return {
                    "status": "healthy",
                    "info": "Redis responding but info format unknown"
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# Factory function to get Redis client instance
def get_redis_client() -> RedisClient:
    """Get Redis client instance"""
    return RedisClient()


# Singleton instance for backwards compatibility
_redis_client_instance: Optional[RedisClient] = None

def get_singleton_redis_client() -> RedisClient:
    """Get singleton Redis client instance"""
    global _redis_client_instance
    if _redis_client_instance is None:
        _redis_client_instance = RedisClient()
    return _redis_client_instance

redis_client = get_singleton_redis_client()