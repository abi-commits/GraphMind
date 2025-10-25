from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

import json
import re
import hashlib

from src.config.settings import settings
from src.config.logging import GraphMindException, logging

class RelationshipExtractor:
    def __init__(self) -> None:
        # Use Gemini for all LLM tasks
        self.llm = ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0,
            max_retries=5,
            timeout=settings.LLM_TIMEOUT
        )
        self._setup_prompt()
        # Cache for storing relationship extraction results
        self._relationship_cache: Dict[str, List[Dict[str, Any]]] = {}


    def _setup_prompt(self):
        self.relationship_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at extracting relationships between entities. Identify how entities are connected.
            
            Common Relationship Types:
            - WORKS_FOR: Employment relationships
            - LOCATED_IN: Geographical relationships  
            - PART_OF: Membership or inclusion
            - CREATED_BY: Creation relationships
            - USES: Utilization relationships
            - STUDIED: Educational relationships
            - DEVELOPED: Development relationships
            - INFLUENCED_BY: Influence relationships
            - RELATED_TO: General connections
            
            Return JSON format:
            {{
                "relationships": [
                    {{
                        "source": "source entity name",
                        "target": "target entity name", 
                        "type": "RELATIONSHIP_TYPE",
                        "description": "how they are related",
                        "confidence": 0.9
                    }}
                ]
            }}"""),
            ("human", """Extract relationships between entities from this text:
            
            Entities: {entities}
            
            Text: {text}""")
        ])
        self.chain = self.relationship_prompt | self.llm | StrOutputParser()

    def extract_relationships(self, text: str, entities: List[Dict[str, Any]], max_length: int = 4000) -> List[Dict[str, Any]]:
        try:
            # Truncate text if needed
            if len(text) > max_length:
                text = text[:max_length] + "...[text truncated]"

            entity_str = ", ".join([f"{entity['name']} ({entity['type']})" for entity in entities])
            
            # Check cache first
            cache_key = self._generate_cache_key(text, entity_str)
            if cache_key in self._relationship_cache:
                logging.debug(f"Cache hit for relationship extraction (key: {cache_key[:10]}...)")
                return self._relationship_cache[cache_key]

            # Extract relationships using LLM
            logging.debug(f"Cache miss for relationship extraction, calling LLM (key: {cache_key[:10]}...)")
            response = self.chain.invoke({"text": text, "entities": entity_str})

            relationship_data = self._parse_json_response(response)
            relationships = relationship_data.get("relationships", [])
            
            # Store in cache
            self._relationship_cache[cache_key] = relationships
            logging.info(f"Extracted {len(relationships)} relationships (cached for future use)")
            
            return relationships
        except Exception as e:
            logging.error(f"Error extracting relationships: {e}")
            raise GraphMindException(f"Error extracting relationships: {e}")
        
    def _generate_cache_key(self, text: str, entity_str: str) -> str:
        """Generate a cache key based on text content and entities."""
        # Create a hash of both text and entities for caching
        combined = f"{text}|{entity_str}"
        text_hash = hashlib.md5(combined.encode('utf-8')).hexdigest()
        return f"relationships_{text_hash}"
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            json_match = re.search(r'(\{.*\})', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(1))
                except Exception as inner_e:
                    logging.error(f"Failed to parse matched JSON: {inner_e}")
                    
            return {"relationships": []}
    
    def clear_cache(self) -> None:
        """Clear the relationship extraction cache."""
        self._relationship_cache.clear()
        logging.info("Relationship extraction cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "cache_size": len(self._relationship_cache),
            "cached_items": list(self._relationship_cache.keys())[:5]  # Show first 5 keys
        }