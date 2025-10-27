# 🧠 GraphMind

Transform your documents into interactive, queryable, and visually engaging knowledge graphs.

## Overview
GraphMind is a mono-repo that combines the power of FastAPI, LangGraph, and modern frontend technologies to enable seamless document ingestion, processing, and visualization. With GraphMind, you can:

- Ingest and process documents (PDF, TXT, MD, and more).
- Extract entities, relationships, and metrics using LLMs.
- Store and query data with ChromaDB.
- Visualize knowledge graphs in an intuitive React-based UI.

## Repository Structure

```
GraphMind/
├── backend/       # Backend service built with FastAPI
│   ├── src/       # Core backend logic
│   │   ├── api/               # FastAPI routes and Pydantic models
│   │   ├── components/        # Modular components for ingestion, processing, and graph building
│   │   ├── workflows/         # LangGraph workflows and state management
│   │   ├── config/            # Configuration and logging
│   ├── tests/     # Pytest test suite
│   └── main.py    # FastAPI app entrypoint
├── frontend/      # Frontend application built with Vite + React + TypeScript
│   ├── src/       # React components, hooks, and pages
│   ├── vite.config.ts
│   └── package.json
```

## Key Features

### Backend
- **Document Ingestion**: Supports multiple formats (PDF, TXT, MD, etc.).
- **Smart Chunking**: Recursive and token-based strategies for text segmentation.
- **Semantic Search**: Powered by ChromaDB for efficient retrieval.
- **Knowledge Graph Extraction**: Entity and relationship extraction using LLMs.
- **Orchestrated Pipelines**: Modular workflows with LangGraph.
- **RESTful API**: Clean and scalable API endpoints.

### Frontend
- **Interactive UI**: Upload documents, run queries, and visualize knowledge graphs.
- **Modern Stack**: Built with Vite, React, TypeScript, and TailwindCSS.
- **Real-Time Updates**: Seamless integration with backend APIs.

## Quickstart Guide

### Prerequisites
- **Backend**: Python 3.11, Redis, Docker (optional).
- **Frontend**: Node.js (v16+), npm or yarn.

### Running Locally

#### Backend
1. Navigate to the `backend/` directory.
2. Create a `.env` file (refer to `backend/README.md` for required variables).
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend
1. Navigate to the `frontend/` directory.
2. Create a `.env` file with the following content:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Access the Application
- **Backend**: API documentation available at `http://localhost:8000/docs`.
- **Frontend**: Open `http://localhost:5173` in your browser.

## Deployment

GraphMind is designed for deployment on modern platforms:
- **Frontend**: Deploy on Vercel for seamless CI/CD.
- **Backend**: Deploy on Render with Redis for task management.

Refer to the `docs/DEPLOYMENT.md` for detailed instructions.

## Additional Resources

- **Backend Documentation**: [backend/README.md](backend/README.md)
- **Frontend Documentation**: [frontend/README.md](frontend/README.md)
- **Redis Optimization**: [docs/REDIS_OPTIMIZATION.md](docs/REDIS_OPTIMIZATION.md)

## Notes
- LLM-powered features require an API key. Refer to `backend/README.md` for environment variable setup.
- ChromaDB supports both embedded (persistent client) and remote configurations.

---

Crafted with ❤️ by the GraphMind team.

