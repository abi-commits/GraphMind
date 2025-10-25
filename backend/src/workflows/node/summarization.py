from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from src.workflows.state import GraphState
from src.config.settings import settings
from src.config.logging import logging


def generate_summary(state: GraphState) -> GraphState:
    """Generate a concise summary from the knowledge graph"""
    try:
        if state.combined_context and state.query:
            # Use Gemini for all LLM tasks
            llm = ChatGoogleGenerativeAI(
                model=settings.LLM_MODEL,
                google_api_key=settings.GOOGLE_API_KEY,
                temperature=0,
                timeout=settings.LLM_TIMEOUT
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