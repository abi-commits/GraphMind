from typing import Dict, Any
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from src.workflows.state import GraphState
from src.config.settings import settings
from src.config.logging import logging


def generate_summary(state: GraphState) -> GraphState:
    """Generate a concise summary from the knowledge graph"""
    try:
        if state.combined_context and state.query:
            llm = ChatOpenAI( # type: ignore[operator]
                model=settings.OPENAI_MODEL,
                openai_api_key=settings.OPENAI_API_KEY,
                temperature=0
            )

            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a helpful research assistant. Create a comprehensive summary that answers the user's query."),
                ("human", """Query: {query}
                
                Context: {context}
                
                Please provide a detailed summary that addresses the query:""")
            ])

            chain = prompt | llm
            summary = chain.invoke({
                "query": state.query,
                "context": state.combined_context
            }).content

            state_data = state.model_dump()
            state_data.update({
                "summary": summary,
                "current_step": "summary_generated"
            })
            return GraphState(**state_data)
        return state
    except Exception as e:
        state_data = state.model_dump()
        state_data.update({"error": f"Summary generation failed: {e}", "current_step": "error"})
        return GraphState(**state_data)