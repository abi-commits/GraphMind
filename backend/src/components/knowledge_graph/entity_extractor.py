from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pydantic import SecretStr

import json
import re

from src.config.settings import settings
from src.config.logging import GraphMindException, logging



class EntityExtractor:
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
            {
                "entities": [
                    {
                        "name": "entity name",
                        "type": "ENTITY_TYPE",
                        "description": "brief description",
                        "confidence": 0.9
                    }
                ]
            }"""),
            ("human", "Extract entities from this text:\n\n{text}")
        ])
        self.chain = self.entity_extraction_prompt | self.llm | StrOutputParser() | RunnablePassthrough()

    def extract_entities(self, text: str, max_length: int = 4000) -> List[Dict[str, Any]]:
        try:
            if len(text) > max_length:
                text = text[:max_length] + "...[text truncated]"

            response = self.chain.invoke({"text": text})

            entity_data = self._parse_json_response(response)
            return entity_data.get("entities", [])
        except Exception as e:
            logging.error(f"Error extracting entities: {e}")
            raise GraphMindException(f"Error extracting entities: {e}")

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

