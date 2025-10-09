from langchain_community.document_loaders import PyPDFLoader, TextLoader, UnstructuredFileLoader, UnstructuredMarkdownLoader
from langchain.schema import Document
from typing import List, Tuple, Dict
from pathlib import Path
import os
from src.config.settings import settings
from src.config.logging import GraphMindException, logging

class DocumentLoader:
    def __init__(self) -> None:
        pass

    def load_documents(self, file_path: str) -> Tuple[List[Document], Dict]:

        try:
            # Validate file
            self._validate_file(file_path)
            
            # Get file metadata
            file_metadata = self._get_file_metadata(file_path)
            
            # Load based on file type
            if file_path.lower().endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            elif file_path.lower().endswith('.txt'):
                loader = TextLoader(file_path, encoding='utf-8')
            elif file_path.lower().endswith('.md'):
                loader = UnstructuredMarkdownLoader(file_path)
            else:
                loader = UnstructuredFileLoader(file_path)
                
            documents = loader.load()
            
            # Add file metadata to each document
            for doc in documents:
                doc.metadata.update(file_metadata)
            
            logging.info(f"Loaded {len(documents)} documents from {file_path}")
            return documents, file_metadata
            
        except Exception as e:
            logging.error(f"Error loading document {file_path}: {str(e)}")
            raise GraphMindException(f"Error loading document: {e}")
    
    def _validate_file(self, file_path: str) -> None:
        """Validate file before processing"""
        if not os.path.exists(file_path):
            raise GraphMindException(f"File not found: {file_path}")
        
        if not os.path.isfile(file_path):
            raise GraphMindException(f"Path is not a file: {file_path}")
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size > settings.MAX_FILE_SIZE:
            raise GraphMindException(f"File too large: {file_size} bytes (max: {settings.MAX_FILE_SIZE})")
    
    def _get_file_metadata(self, file_path: str) -> Dict:
        """Extract metadata from file"""
        file_stats = os.stat(file_path)
        file_ext = os.path.splitext(file_path)[1].lower()
        
        return {
            "file_name": os.path.basename(file_path),
            "file_path": file_path,
            "file_size": file_stats.st_size,
            "file_type": file_ext[1:] if file_ext.startswith('.') else file_ext, 
            "modified_time": file_stats.st_mtime,
            "created_time": file_stats.st_ctime
        }