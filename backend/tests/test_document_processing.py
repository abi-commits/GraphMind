import pytest
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
from langchain.schema import Document

from src.components.data_ingestion.doc_loader import DocumentLoader
from src.components.processing.chunking import create_chunker, Chunker
from src.components.processing.embeddings import EmbeddingGenerator
from src.components.processing.vector_store import create_vector_store, ChromaVectorStore
from src.config.logging import GraphMindException


class TestDocumentLoading:
    """Test document loading functionality"""
    
    @pytest.fixture
    def temp_test_file(self):
        """Create a temporary test file"""
        content = """
        Sample Document for Testing
        
        This document contains test content for document processing.
        It includes multiple paragraphs and sections to test chunking.
        
        Section 1: Introduction
        The introduction provides context about the document.
        
        Section 2: Main Content
        The main content section has detailed information.
        
        Section 3: Conclusion
        The conclusion summarizes the key points.
        """
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(content)
            temp_path = f.name
        
        yield temp_path
        
        if os.path.exists(temp_path):
            os.unlink(temp_path)
    
    def test_load_document_success(self, temp_test_file):
        """Test successful document loading"""
        loader = DocumentLoader()
        documents, metadata = loader.load_documents(temp_test_file)
        
        assert len(documents) > 0
        assert isinstance(documents[0], Document)
        assert "Sample Document" in documents[0].page_content
        assert metadata["file_type"] == "txt"
        assert metadata["file_name"] == os.path.basename(temp_test_file)

    def test_load_document_invalid_path(self):
        """Test loading document with invalid path"""
        loader = DocumentLoader()
        
        with pytest.raises(GraphMindException) as exc_info:
            loader.load_documents("/nonexistent/path/file.txt")
        
        assert "File not found" in str(exc_info.value)
    
    def test_load_document_metadata_extraction(self, temp_test_file):
        """Test document metadata extraction"""
        loader = DocumentLoader()
        documents, metadata = loader.load_documents(temp_test_file)
        
        required_fields = ["file_name", "file_path", "file_size", "file_type"]
        for field in required_fields:
            assert field in metadata
        
        assert metadata["file_size"] > 0
        assert metadata["file_path"] == temp_test_file
    
    def test_file_size_validation(self, temp_test_file):
        """Test file size limit validation"""
        with patch('src.components.data_ingestion.doc_loader.settings') as mock_settings:
            mock_settings.MAX_FILE_SIZE = 10  # Very small limit (10 bytes)
            
            loader = DocumentLoader()
            
            with pytest.raises(GraphMindException) as exc_info:
                loader.load_documents(temp_test_file)
            
            assert "File too large" in str(exc_info.value) or "too large" in str(exc_info.value).lower()


class TestDocumentChunking:
    """Test document chunking functionality"""
    
    @pytest.fixture
    def sample_documents(self):
        """Create sample documents for testing"""
        return [
            Document(
                page_content="This is the first paragraph. " * 20,
                metadata={"source": "doc1.txt", "page": 1}
            ),
            Document(
                page_content="This is the second paragraph. " * 20,
                metadata={"source": "doc2.txt", "page": 1}
            )
        ]
    
    def test_chunk_documents_recursive(self, sample_documents):
        """Test recursive character chunking"""
        chunker = create_chunker("recursive")
        chunks = chunker.chunk_documents(sample_documents)
        
        assert len(chunks) > 0
        assert all(isinstance(chunk, Document) for chunk in chunks)
        assert all(len(chunk.page_content) > 0 for chunk in chunks)
    
    def test_chunk_documents_token(self, sample_documents):
        """Test token-based chunking"""
        # Patch the settings to use a valid OpenAI model for tiktoken
        with patch('src.components.processing.chunking.settings') as mock_settings:
            mock_settings.CHUNK_SIZE = 500
            mock_settings.CHUNK_OVERLAP = 200
            mock_settings.EMBEDDING_MODEL = "gpt-3.5-turbo"  # Valid tiktoken model
            
            chunker = create_chunker("token")
            chunks = chunker.chunk_documents(sample_documents)
            
            assert len(chunks) > 0
            assert all(isinstance(chunk, Document) for chunk in chunks)
    
    def test_chunk_text_with_metadata(self):
        """Test chunking text with custom metadata"""
        chunker = create_chunker("recursive")
        
        text = "This is a test text for chunking. " * 30
        metadata = {"source": "test.txt", "author": "test_author"}
        
        chunks = chunker.chunk_text(text, metadata)
        
        assert len(chunks) > 0
        for chunk in chunks:
            assert chunk.metadata["source"] == "test.txt"
            assert chunk.metadata["author"] == "test_author"
    
    def test_chunk_empty_document_list(self):
        """Test chunking empty document list"""
        chunker = create_chunker("recursive")
        chunks = chunker.chunk_documents([])
        
        assert chunks == []
    
    def test_chunk_size_consistency(self):
        """Test that chunks respect size limits"""
        chunker = create_chunker("recursive")
        
        long_text = "Word " * 1000
        chunks = chunker.chunk_text(long_text)
        
        # Most chunks should be reasonable size (allowing for overlap)
        for chunk in chunks:
            assert len(chunk.page_content) <= 800  # Chunk size + some buffer


class TestEmbeddingGeneration:
    """Test embedding generation functionality"""
    
    @patch('src.components.processing.embeddings.HuggingFaceEmbeddings')
    def test_embed_documents(self, mock_hf_embeddings):
        """Test document embedding generation"""
        mock_model = Mock()
        mock_embeddings = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]
        mock_model.embed_documents.return_value = mock_embeddings
        mock_hf_embeddings.return_value = mock_model
        
        generator = EmbeddingGenerator()
        texts = ["Document 1", "Document 2"]
        
        embeddings = generator.embed_documents(texts)
        
        assert embeddings == mock_embeddings
        mock_model.embed_documents.assert_called_once_with(texts)
    
    @patch('src.components.processing.embeddings.HuggingFaceEmbeddings')
    def test_embed_query(self, mock_hf_embeddings):
        """Test query embedding generation"""
        mock_model = Mock()
        mock_embedding = [0.7, 0.8, 0.9]
        mock_model.embed_query.return_value = mock_embedding
        mock_hf_embeddings.return_value = mock_model
        
        generator = EmbeddingGenerator()
        query = "What is this about?"
        
        embedding = generator.embed_query(query)
        
        assert embedding == mock_embedding
        mock_model.embed_query.assert_called_once_with(query)
    
    @patch('src.components.processing.embeddings.HuggingFaceEmbeddings')
    def test_batch_embedding(self, mock_hf_embeddings):
        """Test batch embedding processing"""
        mock_model = Mock()
        batch_1 = [[0.1, 0.2], [0.3, 0.4]]
        batch_2 = [[0.5, 0.6]]
        mock_model.embed_documents.side_effect = [batch_1, batch_2]
        mock_hf_embeddings.return_value = mock_model
        
        generator = EmbeddingGenerator()
        texts = ["Doc 1", "Doc 2", "Doc 3"]
        
        embeddings = generator.embed_documents_batch(texts, batch_size=2)
        
        assert len(embeddings) == 3
        assert embeddings == batch_1 + batch_2


class TestVectorStoreOperations:
    """Test vector store operations"""
    
    @patch('src.components.processing.vector_store.chromadb.PersistentClient')
    @patch('src.components.processing.vector_store.Chroma')
    def test_add_documents_to_store(self, mock_chroma, mock_client):
        """Test adding documents to vector store"""
        mock_client_instance = Mock()
        mock_chroma_instance = Mock()
        
        mock_client.return_value = mock_client_instance
        mock_chroma.return_value = mock_chroma_instance
        
        mock_embedding_generator = Mock()
        
        with patch('src.components.processing.vector_store.settings') as mock_settings:
            mock_settings.CHROMA_HOST = None
            mock_settings.CHROMA_PORT = None
            mock_settings.VECTOR_STORE_PATH = "/test/path"
            mock_settings.CHROMA_COLLECTION_NAME = "test_collection"
            
            vector_store = ChromaVectorStore(mock_embedding_generator)
        
        documents = [
            Document(page_content="Test doc 1"),
            Document(page_content="Test doc 2")
        ]
        
        vector_store.add_documents(documents)
        
        mock_chroma_instance.add_documents.assert_called_once_with(documents)
    
    @patch('src.components.processing.vector_store.chromadb.PersistentClient')
    @patch('src.components.processing.vector_store.Chroma')
    def test_query_vector_store(self, mock_chroma, mock_client):
        """Test querying vector store"""
        mock_client_instance = Mock()
        mock_chroma_instance = Mock()
        
        mock_results = [
            Document(page_content="Result 1", metadata={"score": 0.9}),
            Document(page_content="Result 2", metadata={"score": 0.8})
        ]
        mock_chroma_instance.similarity_search.return_value = mock_results
        
        mock_client.return_value = mock_client_instance
        mock_chroma.return_value = mock_chroma_instance
        
        mock_embedding_generator = Mock()
        
        with patch('src.components.processing.vector_store.settings') as mock_settings:
            mock_settings.CHROMA_HOST = None
            mock_settings.CHROMA_PORT = None
            mock_settings.VECTOR_STORE_PATH = "/test/path"
            mock_settings.CHROMA_COLLECTION_NAME = "test_collection"
            
            vector_store = ChromaVectorStore(mock_embedding_generator)
        
        results = vector_store.query("test query", top_k=5)
        
        assert len(results) == 2
        assert results[0].page_content == "Result 1"
        mock_chroma_instance.similarity_search.assert_called_once()
    
    @patch('src.components.processing.vector_store.chromadb.PersistentClient')
    @patch('src.components.processing.vector_store.Chroma')
    def test_vector_store_health_check(self, mock_chroma, mock_client):
        """Test vector store health check"""
        mock_client_instance = Mock()
        mock_chroma_instance = Mock()
        mock_chroma_instance.similarity_search.return_value = []
        
        mock_client.return_value = mock_client_instance
        mock_chroma.return_value = mock_chroma_instance
        
        mock_embedding_generator = Mock()
        
        with patch('src.components.processing.vector_store.settings') as mock_settings:
            mock_settings.CHROMA_HOST = None
            mock_settings.CHROMA_PORT = None
            mock_settings.VECTOR_STORE_PATH = "/test/path"
            mock_settings.CHROMA_COLLECTION_NAME = "test_collection"
            
            vector_store = ChromaVectorStore(mock_embedding_generator)
        
        health = vector_store.health_check()
        
        assert health["status"] == "healthy"


class TestDocumentProcessingPipeline:
    """Test complete document processing pipeline"""
    
    @pytest.fixture
    def pipeline_test_file(self):
        """Create a test file for pipeline testing"""
        content = """
        Machine Learning in Healthcare
        
        Machine learning is transforming healthcare through predictive analytics.
        Researchers are developing algorithms to diagnose diseases earlier.
        
        Applications include:
        - Medical imaging analysis
        - Drug discovery
        - Patient outcome prediction
        - Personalized treatment plans
        
        The future of healthcare relies on AI integration.
        """
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(content)
            temp_path = f.name
        
        yield temp_path
        
        if os.path.exists(temp_path):
            os.unlink(temp_path)
    
    @patch('src.components.processing.vector_store.chromadb.HttpClient')
    @patch('src.components.processing.embeddings.HuggingFaceEmbeddings')
    @patch('src.components.processing.vector_store.chromadb.PersistentClient')
    @patch('src.components.processing.vector_store.Chroma')
    def test_complete_document_pipeline(self, mock_chroma, mock_persistent_client, mock_hf_embeddings, mock_http_client, pipeline_test_file):
        """Test complete document processing pipeline"""
        # Setup mocks
        mock_client_instance = Mock()
        mock_http_client_instance = Mock()
        mock_chroma_instance = Mock()
        mock_embedding_model = Mock()
        
        mock_persistent_client.return_value = mock_client_instance
        mock_http_client.return_value = mock_http_client_instance
        mock_chroma.return_value = mock_chroma_instance
        mock_hf_embeddings.return_value = mock_embedding_model
        
        # Mock collection methods
        mock_collection = Mock()
        mock_client_instance.get_or_create_collection.return_value = mock_collection
        mock_http_client_instance.get_or_create_collection.return_value = mock_collection
        
        # Step 1: Load document
        loader = DocumentLoader()
        documents, metadata = loader.load_documents(pipeline_test_file)
        
        assert len(documents) > 0
        assert "Machine Learning" in documents[0].page_content
        
        # Step 2: Chunk documents
        chunker = create_chunker("recursive")
        chunks = chunker.chunk_documents(documents)
        
        assert len(chunks) >= len(documents)
        
        # Step 3: Generate embeddings
        mock_embeddings = [[0.1, 0.2, 0.3] for _ in chunks]
        mock_embedding_model.embed_documents.return_value = mock_embeddings
        
        embedding_generator = EmbeddingGenerator()
        
        # Step 4: Store in vector store
        vector_store = create_vector_store(embedding_generator)
        vector_store.add_documents(chunks)
        
        # Verify pipeline completion
        mock_chroma_instance.add_documents.assert_called_once()
        assert len(mock_chroma_instance.add_documents.call_args[0][0]) == len(chunks)
    
    def test_pipeline_with_empty_document(self):
        """Test pipeline handling of empty documents"""
        loader = DocumentLoader()
        chunker = create_chunker("recursive")
        
        # Create empty file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            empty_file = f.name
        
        try:
            documents, metadata = loader.load_documents(empty_file)
            chunks = chunker.chunk_documents(documents)
            
            # Should handle gracefully
            assert isinstance(chunks, list)
            
        finally:
            if os.path.exists(empty_file):
                os.unlink(empty_file)