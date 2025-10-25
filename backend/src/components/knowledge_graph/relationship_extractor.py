from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from pydantic import SecretStr

import json
import re

from src.config.settings import settings
from src.config.logging import GraphMindException, logging

class RelationshipExtractor:
    def __init__(self) -> None:
        # Convert string API key to SecretStr for ChatOpenAI
        api_key = SecretStr(settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
        self.llm = ChatOpenAI(
            model=settings.OPENAI_MODEL,
            api_key=api_key,
            temperature=0
        )
        self._setup_prompt()


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
            {
                "relationships": [
                    {
                        "source": "source entity name",
                        "target": "target entity name", 
                        "type": "RELATIONSHIP_TYPE",
                        "description": "how they are related",
                        "confidence": 0.9
                    }
                ]
            }"""),
            ("human", """Extract relationships between entities from this text:
            
            Entities: {entities}
            
            Text: {text}""")
        ])
        self.chain = self.relationship_prompt | self.llm | StrOutputParser()

    def extract_relationships(self, text: str, entities: List[Dict[str, Any]], max_length: int = 4000) -> List[Dict[str, Any]]:
        try:
            if len(text) > max_length:
                text = text[:max_length] + "...[text truncated]"

            entity_str = ", ".join([f"{entity['name']} ({entity['type']})" for entity in entities])

            response = self.chain.invoke({"text": text, "entities": entity_str})

            relationship_data = self._parse_json_response(response)
            return relationship_data.get("relationships", [])
        except Exception as e:
            logging.error(f"Error extracting relationships: {e}")
            raise GraphMindException(f"Error extracting relationships: {e}")
        
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