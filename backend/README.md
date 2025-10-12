# GraphMind Backend

FastAPI service that ingests documents, chunks and embeds them into ChromaDB, extracts knowledge graphs using LLMs, and serves REST APIs.

## Tech stack
- FastAPI, Pydantic
- LangChain, LangGraph
- ChromaDB (vector store)
- HuggingFace embeddings
- OpenAI (LLM) for entity/relationship extraction and summarization

## Requirements
- Python 3.10+
- OpenAI API key (for LLM features)

## Environment variables
Create a `.env` file in `backend/` with at least:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
EMBEDDING_DEVICE=cpu
DATA_DIR=./data
CHROMA_HOST=
CHROMA_PORT=
CHROMA_COLLECTION_NAME=graphmind_collection
```

If `CHROMA_HOST` and `CHROMA_PORT` are empty, the app uses a local persistent Chroma store at `settings.VECTOR_STORE_PATH`.

## Install & run

```bash
# From the repository root
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run API
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Docs: http://localhost:8000/docs

## API overview
- GET `/health` – service health with component statuses
- POST `/query` – run query through workflow; returns summary, entities, relationships, graph data
- POST `/documents/process` – process a document (sync or background)
- GET `/tasks/{task_id}` – background task status
- GET `/documents/stats` – collection stats from ChromaDB

## Tests

```bash
cd backend
pytest -q
```

## Project layout
```
backend/
  main.py
  src/
    api/
    components/
    config/
    workflows/
  tests/
```
