# Simple logging setup
import logging

logging.basicConfig(
	level=logging.INFO,
	format='%(asctime)s - %(levelname)s - %(message)s'
)

# Custom exception class
class GraphMindException(Exception):
    """Custom exception for GraphMind application."""
    pass
