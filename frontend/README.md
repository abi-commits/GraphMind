# GraphMind Frontend

Vite + React + TypeScript app for interacting with the GraphMind backend: upload documents, run queries, and visualize knowledge graphs.

## Requirements
- Node 18+

## Environment
Create `frontend/.env` with:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Install & run

```bash
cd frontend
npm install
npm run dev
```

Dev server: http://localhost:8080

## Build

```bash
npm run build
npm run preview
```

## Tech stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query for data fetching

## Notes
- Ensure the backend is running and CORS allows the dev origin if needed.
**Edit a file directly in GitHub**
