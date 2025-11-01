import redis
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from src.config.settings import settings
from src.config.logging import logging


class RedisClient:
    """Production-ready Redis client for task management and caching."""

    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._connect()

    def _connect(self, retries: int = 5, delay: float = 1.0):
        """Initialize Redis connection with retry logic and error handling."""
        if not getattr(settings, "REDIS_URL", None):
            logging.error("❌ Missing REDIS_URL in configuration.")
            self.redis_client = None
            return

        for attempt in range(1, retries + 1):
            try:
                self.redis_client = redis.Redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30,
                )

                # Test the connection
                self.redis_client.ping()
                logging.info("✅ Successfully connected to Redis (URL-based connection).")
                return
            except (redis.ConnectionError, redis.TimeoutError) as e:
                logging.warning(
                    f"Redis connection attempt {attempt}/{retries} failed: {type(e).__name__} - {e}"
                )
                time.sleep(delay)
                delay *= 2  # exponential backoff
            except Exception as e:
                logging.error(f"❌ Unexpected Redis error: {type(e).__name__} - {e}")
                break

        logging.error("🚨 All attempts to connect to Redis failed.")
        self.redis_client = None

    def _ensure_connection(self) -> bool:
        """Ensure Redis connection is available."""
        if self.redis_client is None:
            self._connect()
        return self.redis_client is not None

    def set_task(self, task_id: str, task_data: Dict[str, Any], ttl: int = 3600) -> bool:
        """Store task data in Redis with TTL."""
        if not self._ensure_connection() or self.redis_client is None:
            logging.warning("Redis unavailable, cannot store task.")
            return False

        try:
            task_data_copy = task_data.copy()
            task_data_copy["updated_at"] = datetime.utcnow().isoformat()
            key = f"task:{task_id}"

            result = self.redis_client.setex(key, ttl, json.dumps(task_data_copy, default=str))
            if result:
                logging.info(f"Stored task {task_id} in Redis.")
            return bool(result)
        except Exception as e:
            logging.error(f"Error storing task {task_id}: {e}")
            return False

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve task data from Redis."""
        if not self._ensure_connection() or self.redis_client is None:
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
        """Update task status and additional fields."""
        if not self._ensure_connection() or self.redis_client is None:
            return False

        try:
            task_data = self.get_task(task_id)
            if not task_data:
                logging.warning(f"Task {task_id} not found for update.")
                return False

            task_data.update(kwargs)
            task_data["status"] = status
            task_data["updated_at"] = datetime.utcnow().isoformat()
            return self.set_task(task_id, task_data)
        except Exception as e:
            logging.error(f"Error updating task {task_id}: {e}")
            return False

    def delete_task(self, task_id: str) -> bool:
        """Delete a task from Redis."""
        if not self._ensure_connection() or self.redis_client is None:
            return False

        try:
            result = self.redis_client.delete(f"task:{task_id}")
            if result:
                logging.info(f"Deleted task {task_id} from Redis.")
            return bool(result)
        except Exception as e:
            logging.error(f"Error deleting task {task_id}: {e}")
            return False

    def get_all_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Retrieve all tasks stored in Redis."""
        if not self._ensure_connection() or self.redis_client is None:
            return {}

        try:
            tasks = {}
            for key in self.redis_client.scan_iter("task:*"):
                if isinstance(key, str):
                    task_id = key.split("task:")[-1]
                    data = self.redis_client.get(key)
                    if data and isinstance(data, str):
                        tasks[task_id] = json.loads(data)
            return tasks
        except Exception as e:
            logging.error(f"Error retrieving all tasks: {e}")
            return {}

    def cleanup_completed_tasks(self, older_than_hours: int = 24) -> int:
        """Clean up completed/failed tasks older than a given time."""
        if not self._ensure_connection() or self.redis_client is None:
            return 0

        try:
            cutoff = datetime.utcnow() - timedelta(hours=older_than_hours)
            deleted_count = 0

            for task_id, task_data in self.get_all_tasks().items():
                if task_data.get("status") in ("completed", "failed"):
                    updated_at = task_data.get("updated_at")
                    if updated_at:
                        try:
                            dt = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
                            if dt < cutoff and self.delete_task(task_id):
                                deleted_count += 1
                        except ValueError:
                            continue

            logging.info(f"Cleaned up {deleted_count} old completed tasks.")
            return deleted_count
        except Exception as e:
            logging.error(f"Error cleaning up tasks: {e}")
            return 0

    def health_check(self) -> Dict[str, Any]:
        """Perform a Redis health check."""
        if not self._ensure_connection() or self.redis_client is None:
            return {"status": "unhealthy", "error": "Redis unavailable"}

        try:
            self.redis_client.ping()
            info = self.redis_client.info()
            if isinstance(info, dict):
                return {
                    "status": "healthy",
                    "connected_clients": info.get("connected_clients", 0),
                    "used_memory": info.get("used_memory_human", "unknown"),
                    "uptime": info.get("uptime_in_seconds", 0),
                }
            return {"status": "healthy", "info": "Redis responding"}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}


# Lazy singleton instance for reuse
_redis_instance: Optional[RedisClient] = None

def get_redis_client() -> RedisClient:
    """Get or create the singleton Redis client instance."""
    global _redis_instance
    if _redis_instance is None:
        _redis_instance = RedisClient()
    return _redis_instance

# Export singleton for backward compatibility
redis_client = get_redis_client()
