import pytest
import json
from unittest.mock import Mock, patch
from langchain.schema import Document
import networkx as nx

from src.components.knowledge_graph.entity_extractor import EntityExtractor
from src.components.knowledge_graph.relationship_extractor import RelationshipExtractor
from src.components.knowledge_graph.graph_builder import KnowledgeGraphBuilder
from src.components.knowledge_graph.orchestrator import GraphOrchestrator
from src.config.logging import GraphMindException


class TestEntityExtractor:
    """Test EntityExtractor.extract_entities() - the core function"""
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatOpenAI')
    def test_extract_entities_success(self, mock_openai):
        """Test successful entity extraction"""
        mock_llm = Mock()
        mock_openai.return_value = mock_llm
        
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
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatOpenAI')
    def test_extract_entities_handles_invalid_json(self, mock_openai):
        """Test handling of invalid JSON response"""
        mock_llm = Mock()
        mock_openai.return_value = mock_llm
        
        extractor = EntityExtractor()
        extractor.chain = Mock()
        extractor.chain.invoke.return_value = "Invalid JSON response"
        
        entities = extractor.extract_entities("Test text")
        
        # Should return empty list when JSON parsing fails
        assert entities == []
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatOpenAI')
    def test_extract_entities_text_truncation(self, mock_openai):
        """Test that long text is truncated"""
        mock_llm = Mock()
        mock_openai.return_value = mock_llm
        
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
    
    @patch('src.components.knowledge_graph.relationship_extractor.ChatOpenAI')
    def test_extract_relationships_success(self, mock_openai):
        """Test successful relationship extraction"""
        mock_llm = Mock()
        mock_openai.return_value = mock_llm
        
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
    
    @patch('src.components.knowledge_graph.relationship_extractor.ChatOpenAI')
    def test_extract_relationships_handles_invalid_json(self, mock_openai):
        """Test handling of invalid JSON response"""
        mock_llm = Mock()
        mock_openai.return_value = mock_llm
        
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
        
        # Verify result structure
        assert "graph" in result
        assert "entities" in result
        assert "relationships" in result
        assert "metrics" in result
        assert "visualization" in result
        
        # Verify graph structure
        graph = result["graph"]
        assert graph.number_of_nodes() == 2
        assert graph.number_of_edges() == 1
        
        # Verify metrics
        metrics = result["metrics"]
        assert metrics["num_nodes"] == 2
        assert metrics["num_edges"] == 1
    
    def test_build_graph_empty_inputs(self):
        """Test building graph with empty inputs"""
        builder = KnowledgeGraphBuilder()
        
        result = builder.build_graph([], [])
        
        assert result["graph"].number_of_nodes() == 0
        assert result["graph"].number_of_edges() == 0
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
            "graph": nx.DiGraph(),
            "entities": mock_entities,
            "relationships": mock_relationships
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
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatOpenAI')
    @patch('src.components.knowledge_graph.relationship_extractor.ChatOpenAI')
    def test_build_graph_from_text_empty_error(self, mock_rel_openai, mock_ent_openai):
        """Test error handling for empty text"""
        # Mock the LLM instances
        mock_rel_openai.return_value = Mock()
        mock_ent_openai.return_value = Mock()
        
        orchestrator = GraphOrchestrator()
        
        with pytest.raises(GraphMindException) as exc_info:
            orchestrator.build_graph_from_text("")
        
        assert "Text cannot be empty" in str(exc_info.value)
    
    @patch('src.components.knowledge_graph.entity_extractor.ChatOpenAI')
    @patch('src.components.knowledge_graph.relationship_extractor.ChatOpenAI')
    def test_build_knowledge_graph_empty_documents_error(self, mock_rel_openai, mock_ent_openai):
        """Test error handling for documents with no content"""
        # Mock the LLM instances
        mock_rel_openai.return_value = Mock()
        mock_ent_openai.return_value = Mock()
        
        orchestrator = GraphOrchestrator()
        
        documents = [Document(page_content="")]
        
        with pytest.raises(GraphMindException) as exc_info:
            orchestrator.build_knowledge_graph(documents)
        
        assert "No text content" in str(exc_info.value)