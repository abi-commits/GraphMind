from typing import List, Dict, Any
from langchain_core.documents import Document

from src.config.logging import GraphMindException, logging
from .entity_extractor import EntityExtractor
from .relationship_extractor import RelationshipExtractor
from .graph_builder import KnowledgeGraphBuilder


class GraphOrchestrator:
    def __init__(self) -> None:
        self.entity_extractor = EntityExtractor()
        self.relationship_extractor = RelationshipExtractor()
        self.graph_builder = KnowledgeGraphBuilder()

    def build_knowledge_graph(self, documents: List[Document]) -> Dict[str, Any]:
        try:
            combined_text = "\n\n".join([doc.page_content for doc in documents])

            if not combined_text.strip():
                raise GraphMindException("No text content found in Document")
            
            entities = self.entity_extractor.extract_entities(combined_text)

            relationships = self.relationship_extractor.extract_relationships(combined_text, entities)

            graph_result = self.graph_builder.build_graph(entities, relationships)

            return graph_result
        
        except Exception as e:
            raise GraphMindException(f"Knowleadge graph orchestrator failed: {e}")
        
    def build_graph_from_text(self, text: str) -> Dict[str, Any]:
        try:
            if not text.strip():
                raise GraphMindException("Text cannot be empty")
            
            doc = Document(page_content=text)
            return self.build_knowledge_graph([doc])
        
        except Exception as e:
            raise GraphMindException(f"Knowledge graph from text failed: {e}")
