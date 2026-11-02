# Company RAG

Retrieval-Augmented Generation (RAG) chatbot for a company — a full-stack monorepo.

A document-aware AI assistant that ingests company documents, indexes them for
semantic search, and answers questions through a LangGraph agent. Users sign in,
upload documents, and chat with the assistant in a web UI.

## Architecture

- **`backend/`** — FastAPI service (Python 3.12)
  - JWT auth via `fastapi-users`, RBAC (roles & departments)
  - Document ingestion (`.pdf` / `.docx`) with versioning
  - Embeddings + semantic retrieval (Pinecone, Cohere, Google GenAI, Ollama, Jina reranking)
  - Chat via a LangGraph agent with conversation state persisted in PostgreSQL
- **`client/`** — Next.js 16 chat UI (React 19, TypeScript, Tailwind CSS, shadcn/ui)
  - Sign in / sign up
  - Chat interface with a conversation sidebar
- **`docker-compose.yml`** — orchestrates backend, frontend, PostgreSQL, Redis, and Redis Insight

## Prerequisites

- Python 3.12+ and [uv](https://docs.astral.sh/uv/)
- Node.js 22+ and npm
- Docker & Docker Compose

## Quick start (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000 (interactive docs at http://localhost:8000/docs)

## Local development

### Backend

```bash
cd backend
# create backend/.env from the required variables below
uv sync
uv run uvicorn app.app:app --reload
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The frontend calls the backend at `NEXT_PUBLIC_API_URL` (defaults to
`http://127.0.0.1:8000`). Set it if the backend runs elsewhere.

## Environment variables

Set these in `backend/.env` (not committed):

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Async PostgreSQL URL (e.g. `postgresql+psycopg://rag:ragpassword@localhost:5432/rag`) |
| `JWT_SECRET` | Secret used to sign JWT auth tokens |
| `UPLOAD_DIR` | Directory for uploaded source documents (default `./data/uploads`) |

Additional provider keys (Pinecone, Cohere, Google GenAI, Jina, etc.) are read by
the modules under `backend/app/embeddings/` and `backend/app/llm/`.

## API overview

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/jwt/login` | Sign in (returns a JWT) |
| POST | `/auth/register` | Register a user |
| GET | `/auth/users/me` | Current user |
| POST | `/chat` | Chat with the assistant |
| POST | `/query` | Semantic search over documents |
| POST | `/embeddings` | Upload & embed a document (`.pdf` / `.docx`) |
| GET / POST / DELETE | `/departments`, `/roles` | Admin management (superuser only) |
| GET | `/users` | List users (superuser only) |
