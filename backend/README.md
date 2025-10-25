# GraphMind Backend

FastAPI service that ingests documents, chunks and embeds them into ChromaDB, extracts knowledge graphs using LLMs, and serves REST APIs with Redis-based background task management.

## Tech stack
- FastAPI, Pydantic
- LangChain, LangGraph
- ChromaDB (vector store)
- Redis (background task management)
- HuggingFace embeddings
- OpenAI (LLM) for entity/relationship extraction and summarization

## Requirements
- Python 3.9+
- Redis server (for background tasks)
- OpenAI API key (for LLM features)

## Environment variables
Copy `.env.example` to `.env` and configure:

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
EMBEDDING_MODEL=all-MiniLM-L6-v2
EMBEDDING_DEVICE=cpu
DATA_DIR=./data
CHROMA_HOST=
CHROMA_PORT=
CHROMA_COLLECTION_NAME=graphmind_collection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

If `CHROMA_HOST` and `CHROMA_PORT` are empty, the app uses a local persistent Chroma store at `settings.VECTOR_STORE_PATH`.

## Setup Redis (Development)

### Option 1: Docker Compose (Recommended)
```bash
docker-compose -f docker-compose.redis.yml up -d
```

### Option 2: Local Redis Installation
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Verify Redis is running
redis-cli ping
```

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
- GET `/health` – service health with component statuses (includes Redis)
- POST `/query` – run query through workflow; returns summary, entities, relationships, graph data
- POST `/documents/process` – process a document (sync or background with Redis)
- GET `/tasks/{task_id}` – background task status from Redis
- GET `/tasks` – list all background tasks
- DELETE `/tasks/cleanup` – clean up old completed/failed tasks
- GET `/documents/stats` – collection stats from ChromaDB and Redis task statistics

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
