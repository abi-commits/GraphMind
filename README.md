# 🧠 GraphMind

Transform documents into interactive knowledge graphs you can query, visualize, and explore.

## What’s inside

This repo is a mono-repo with two apps:

- `backend/` – FastAPI + LangGraph service that ingests documents, chunks text, embeds into ChromaDB, extracts entities/relationships with LLMs, and serves REST APIs.
- `frontend/` – Vite + React + TypeScript UI for uploading documents, running queries, and visualizing the knowledge graph.

## Key features

- Document ingestion for PDF/TXT/MD and more
- Smart chunking (recursive/token strategies)
- Semantic search with ChromaDB
- Knowledge graph extraction using LLMs (entities + relationships + metrics)
- Orchestrated pipelines with LangGraph
- Clean REST API with background tasks

## Architecture (high-level)

1) Ingest file → validate → load → chunk → embed → store in ChromaDB
2) Query → retrieve relevant chunks → extract entities/relationships → build graph → summarize
3) Serve results via FastAPI endpoints; UI consumes these APIs

## Quickstart

Follow the dedicated READMEs for each app:

- Backend: see `backend/README.md`
- Frontend: see `frontend/README.md`

Minimal flow to run both locally:

1) Backend
	 - Create `.env` in `backend/` (see sample in backend README)
	 - Install deps and run the API

2) Frontend
	 - Create `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8000/api/v1`
	 - Install deps and start dev server

## Project structure

```
backend/
	src/
		api/               # Pydantic models + FastAPI routes
		components/
			data_ingestion/  # Document loading
			processing/      # Chunking, embeddings, vector store (Chroma)
			knowledge_graph/ # Entity/relationship extraction, graph build
		workflows/         # LangGraph state + nodes + workflow
		config/            # Settings + logging
	tests/               # Pytest test suite
	main.py              # FastAPI app entrypoint

frontend/
	src/                 # React app (Vite + TS + Tailwind + shadcn)
	vite.config.ts
	package.json
```

## Links

- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

## Notes

- LLM-powered features require an API key (see backend README environment variables).
- ChromaDB can run embedded (persistent client) or remote via HTTP client.

