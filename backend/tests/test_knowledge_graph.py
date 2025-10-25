import pytest
import json
from unittest.mock import Mock, patch
from langchain_core.documents import Document

from src.components.knowledge_graph.entity_extractor import EntityExtractor
from src.components.knowledge_graph.relationship_extractor import RelationshipExtractor
from src.components.knowledge_graph.graph_builder import KnowledgeGraphBuilder
from src.components.knowledge_graph.orchestrator import GraphOrchestrator
from src.config.logging import GraphMindException


class TestEntityExtractor:
    """Test EntityExtractor.extract_entities() - the core function"""
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatGoogleGenerativeAI')
    def test_extract_entities_success(self, mock_gemini):
        """Test successful entity extraction"""
        mock_llm = Mock()
        mock_gemini.return_value = mock_llm
        
        entity_response = json.dumps({
            "entities": [
                {
                    "name": "Alice Johnson",
                    "type": "PERSON",
                    "description": "Software engineer",
                    "confidence": 0.92
                },
                {
                    "name": "Google",
                    "type": "ORGANIZATION",
                    "description": "Technology company",
                    "confidence": 0.95
                }
            ]
        })
        
        extractor = EntityExtractor()
        extractor.chain = Mock()
        extractor.chain.invoke.return_value = entity_response
        
        text = "Alice Johnson works at Google."
        entities = extractor.extract_entities(text)
        
        assert len(entities) == 2
        assert entities[0]["name"] == "Alice Johnson"
        assert entities[0]["type"] == "PERSON"
        assert entities[1]["name"] == "Google"
        assert entities[1]["type"] == "ORGANIZATION"
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatGoogleGenerativeAI')
    def test_extract_entities_handles_invalid_json(self, mock_gemini):
        """Test handling of invalid JSON response"""
        mock_llm = Mock()
        mock_gemini.return_value = mock_llm
        
        extractor = EntityExtractor()
        extractor.chain = Mock()
        extractor.chain.invoke.return_value = "Invalid JSON response"
        
        entities = extractor.extract_entities("Test text")
        
        # Should return empty list when JSON parsing fails
        assert entities == []
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatGoogleGenerativeAI')
    def test_extract_entities_text_truncation(self, mock_gemini):
        """Test that long text is truncated"""
        mock_llm = Mock()
        mock_gemini.return_value = mock_llm
        
        extractor = EntityExtractor()
        extractor.chain = Mock()
        extractor.chain.invoke.return_value = json.dumps({"entities": []})
        
        # Text longer than default max_length (4000)
        long_text = "Test " * 2000
        extractor.extract_entities(long_text)
        
        # Verify chain was called (text was truncated internally)
        extractor.chain.invoke.assert_called_once()
        call_args = extractor.chain.invoke.call_args[0][0]
        assert len(call_args["text"]) <= 4020  # 4000 + truncation message


class TestRelationshipExtractor:
    """Test RelationshipExtractor.extract_relationships() - the core function"""
    
    @patch('src.components.knowledge_graph.relationship_extractor.ChatGoogleGenerativeAI')
    def test_extract_relationships_success(self, mock_gemini):
        """Test successful relationship extraction"""
        mock_llm = Mock()
        mock_gemini.return_value = mock_llm
        
        relationship_response = json.dumps({
            "relationships": [
                {
                    "source": "Alice",
                    "target": "Google",
                    "type": "WORKS_FOR",
                    "description": "Employment relationship",
                    "confidence": 0.9
                }
            ]
        })
        
        extractor = RelationshipExtractor()
        extractor.chain = Mock()
        extractor.chain.invoke.return_value = relationship_response
        
        text = "Alice works at Google."
        entities = [
            {"name": "Alice", "type": "PERSON"},
            {"name": "Google", "type": "ORGANIZATION"}
        ]
        
        relationships = extractor.extract_relationships(text, entities)
        
        assert len(relationships) == 1
        assert relationships[0]["source"] == "Alice"
        assert relationships[0]["target"] == "Google"
        assert relationships[0]["type"] == "WORKS_FOR"
    
    @patch('src.components.knowledge_graph.relationship_extractor.ChatGoogleGenerativeAI')
    def test_extract_relationships_handles_invalid_json(self, mock_gemini):
        """Test handling of invalid JSON response"""
        mock_llm = Mock()
        mock_gemini.return_value = mock_llm
        
        extractor = RelationshipExtractor()
        extractor.chain = Mock()
        extractor.chain.invoke.return_value = "Not valid JSON"
        
        relationships = extractor.extract_relationships("text", [])
        
        # Should return empty list when JSON parsing fails
        assert relationships == []


class TestKnowledgeGraphBuilder:
    """Test KnowledgeGraphBuilder.build_graph() - the core function"""
    
    def test_build_graph_success(self):
        """Test successful graph building from entities and relationships"""
        builder = KnowledgeGraphBuilder()
        
        entities = [
            {"name": "Alice", "type": "PERSON", "description": "Engineer", "confidence": 0.9},
            {"name": "Google", "type": "ORGANIZATION", "description": "Company", "confidence": 0.95}
        ]
        
        relationships = [
            {"source": "Alice", "target": "Google", "type": "WORKS_FOR", "description": "", "confidence": 0.9}
        ]
        
        result = builder.build_graph(entities, relationships)
        
        # Verify result structure (no NetworkX graph, just raw data)
        assert "entities" in result
        assert "relationships" in result
        assert "metrics" in result
        assert "visualization" in result
        
        # Verify entities and relationships are preserved
        assert len(result["entities"]) == 2
        assert len(result["relationships"]) == 1
        
        # Verify metrics
        metrics = result["metrics"]
        assert metrics["num_nodes"] == 2
        assert metrics["num_edges"] == 1
        assert "density" in metrics
        assert "connected_entities" in metrics
    
    def test_build_graph_empty_inputs(self):
        """Test building graph with empty inputs"""
        builder = KnowledgeGraphBuilder()
        
        result = builder.build_graph([], [])
        
        assert len(result["entities"]) == 0
        assert len(result["relationships"]) == 0
        assert result["metrics"]["num_nodes"] == 0
        assert result["metrics"]["num_edges"] == 0


class TestGraphOrchestrator:
    """Test GraphOrchestrator - the main orchestration functions"""
    
    @patch('src.components.knowledge_graph.orchestrator.EntityExtractor')
    @patch('src.components.knowledge_graph.orchestrator.RelationshipExtractor')
    @patch('src.components.knowledge_graph.orchestrator.KnowledgeGraphBuilder')
    def test_build_knowledge_graph_success(self, mock_builder_class, mock_rel_class, mock_ent_class):
        """Test successful knowledge graph building from documents"""
        # Setup mocks
        mock_ent_extractor = Mock()
        mock_rel_extractor = Mock()
        mock_builder = Mock()
        
        mock_ent_class.return_value = mock_ent_extractor
        mock_rel_class.return_value = mock_rel_extractor
        mock_builder_class.return_value = mock_builder
        
        mock_entities = [{"name": "Entity1", "type": "PERSON"}]
        mock_relationships = [{"source": "Entity1", "target": "Entity2", "type": "KNOWS"}]
        mock_graph_result = {
            "entities": mock_entities,
            "relationships": mock_relationships,
            "metrics": {"num_nodes": 2, "num_edges": 1},
            "visualization": {"nodes": [], "edges": []}
        }
        
        mock_ent_extractor.extract_entities.return_value = mock_entities
        mock_rel_extractor.extract_relationships.return_value = mock_relationships
        mock_builder.build_graph.return_value = mock_graph_result
        
        orchestrator = GraphOrchestrator()
        
        documents = [Document(page_content="Alice works at Google.")]
        result = orchestrator.build_knowledge_graph(documents)
        
        # Verify the pipeline was executed
        mock_ent_extractor.extract_entities.assert_called_once()
        mock_rel_extractor.extract_relationships.assert_called_once()
        mock_builder.build_graph.assert_called_once()
        
        assert result == mock_graph_result
    
    @patch('src.components.knowledge_graph.orchestrator.EntityExtractor')
    @patch('src.components.knowledge_graph.orchestrator.RelationshipExtractor')
    @patch('src.components.knowledge_graph.orchestrator.KnowledgeGraphBuilder')
    def test_build_graph_from_text_success(self, mock_builder_class, mock_rel_class, mock_ent_class):
        """Test successful graph building from plain text"""
        mock_ent_extractor = Mock()
        mock_rel_extractor = Mock()
        mock_builder = Mock()
        
        mock_ent_class.return_value = mock_ent_extractor
        mock_rel_class.return_value = mock_rel_extractor
        mock_builder_class.return_value = mock_builder
        
        mock_graph_result = {"success": True}
        mock_ent_extractor.extract_entities.return_value = []
        mock_rel_extractor.extract_relationships.return_value = []
        mock_builder.build_graph.return_value = mock_graph_result
        
        orchestrator = GraphOrchestrator()
        
        text = "Test text for knowledge graph."
        result = orchestrator.build_graph_from_text(text)
        
        assert result == mock_graph_result
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatGoogleGenerativeAI')
    @patch('src.components.knowledge_graph.relationship_extractor.ChatGoogleGenerativeAI')
    def test_build_graph_from_text_empty_error(self, mock_rel_gemini, mock_ent_gemini):
        """Test error handling for empty text"""
        # Mock the LLM instances
        mock_rel_gemini.return_value = Mock()
        mock_ent_gemini.return_value = Mock()
        
        orchestrator = GraphOrchestrator()
        
        with pytest.raises(GraphMindException) as exc_info:
            orchestrator.build_graph_from_text("")
        
        assert "Text cannot be empty" in str(exc_info.value)
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatGoogleGenerativeAI')
    @patch('src.components.knowledge_graph.relationship_extractor.ChatGoogleGenerativeAI')
    def test_build_knowledge_graph_empty_documents_error(self, mock_rel_gemini, mock_ent_gemini):
        """Test error handling for documents with no content"""
        # Mock the LLM instances
        mock_rel_gemini.return_value = Mock()
        mock_ent_gemini.return_value = Mock()
        
        orchestrator = GraphOrchestrator()
        
        documents = [Document(page_content="")]
        
        with pytest.raises(GraphMindException) as exc_info:
            orchestrator.build_knowledge_graph(documents)
        
        assert "No text content" in str(exc_info.value)