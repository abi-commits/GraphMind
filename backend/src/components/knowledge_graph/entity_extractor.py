from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

import json
import re
import hashlib
from functools import lru_cache

from src.config.settings import settings
from src.config.logging import GraphMindException, logging



class EntityExtractor:
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
        # Cache for storing entity extraction results
        self._entity_cache: Dict[str, List[Dict[str, Any]]] = {}

    def _setup_prompt(self):
        self.entity_extraction_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at extracting entities from text. Extract all important entities and categorize them.
            
            Entity Types:
            - PERSON: People, characters, individuals
            - ORGANIZATION: Companies, institutions, groups
            - LOCATION: Places, countries, cities
            - CONCEPT: Ideas, theories, concepts
            - EVENT: Historical events, occurrences
            - TECHNOLOGY: Tools, technologies, systems
            
            Return JSON format:
                        {{
                "entities": [
                    {{
                        "name": "entity name",
                        "type": "ENTITY_TYPE",
                        "description": "brief description",
                        "confidence": 0.9
                    }}
                ]
            }}"""),
            ("human", "Extract entities from this text:\n\n{text}")
        ])
        self.chain = self.entity_extraction_prompt | self.llm | StrOutputParser()

    def extract_entities(self, text: str, max_length: int = 4000) -> List[Dict[str, Any]]:
        try:
            # Truncate text if needed
            if len(text) > max_length:
                text = text[:max_length] + "...[text truncated]"
            
            # Check cache first
            cache_key = self._generate_cache_key(text)
            if cache_key in self._entity_cache:
                logging.debug(f"Cache hit for entity extraction (key: {cache_key[:10]}...)")
                return self._entity_cache[cache_key]

            # Extract entities using LLM
            logging.debug(f"Cache miss for entity extraction, calling LLM (key: {cache_key[:10]}...)")
            response = self.chain.invoke({"text": text})

            entity_data = self._parse_json_response(response)
            entities = entity_data.get("entities", [])
            
            # Store in cache
            self._entity_cache[cache_key] = entities
            logging.info(f"Extracted {len(entities)} entities (cached for future use)")
            
            return entities
        except Exception as e:
            logging.error(f"Error extracting entities: {e}")
            raise GraphMindException(f"Error extracting entities: {e}")

    def _generate_cache_key(self, text: str) -> str:
        """Generate a cache key based on text content."""
        # Create a hash of the text for caching
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        return f"entities_{text_hash}"
    
    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group(0))
                except Exception as inner_e:
                    logging.error(f"Failed to parse matched JSON: {inner_e}")
            logging.error(f"Failed to parse JSON from response: {response}")
            return {"entities": []}
    
    def clear_cache(self) -> None:
        """Clear the entity extraction cache."""
        self._entity_cache.clear()
        logging.info("Entity extraction cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        return {
            "cache_size": len(self._entity_cache),
            "cached_items": list(self._entity_cache.keys())[:5]  # Show first 5 keys
        }

