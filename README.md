# Ecocash AI Relationship Manager

Conversational EcoCash “relationship manager” that lives inside the mobile super-app as a CopilotKit-powered widget. It talks AG-UI with the frontend, runs on Agno AgentOS v2, persists sessions/memory in MongoDB Atlas, and uses FastMCP tooling to talk to wallet/ticket systems (mocked for now).

## Repository Layout

| Path                | Description                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `frontend/`         | Next.js + CopilotKit widget, AG-UI renderer, Storybook, mobile wrapper. |
| `backend/app/`      | FastAPI bootstrap + AgentOS integration, middleware, health routes.     |
| `backend/agent/`    | Agent definition, MCP tool wiring, AG-UI interface + widgets.           |
| `backend/mcp/`      | FastMCP v2 dummy wallet/ticket server (stdio).                          |
| `packages/schemas/` | Shared Zod widget schemas consumed by both sides.                       |
| `docs/`             | PRD, user journeys, architecture notes, milestones.                     |

## Prerequisites

- Node.js 18+ with `pnpm`
- Python 3.12+
- MongoDB Atlas cluster (URI provided via env)
- OpenAI API access (GPT‑5 Mini)
- (Optional) `direnv` or similar for env management

## Environment Variables

Copy `configs/sample.env` to `config/.env` (backend) and set:

- `MONGODB_URI`, `MONGODB_DB_NAME`
- `OPENAI_API_KEY`, `AGNO_MODEL_ID` (defaults to `gpt-5-mini`)
- `MCP_WALLET_BASE_URL`, `MCP_TICKET_BASE_URL` (dummy FastMCP for local dev)
- Frontend `NEXT_PUBLIC_*` values (used by CopilotKit runtime + API proxy)
- Optional: `USE_IN_MEMORY_DB=true` for running backend tests without Mongo.

> **Mobile wrapper:** Load `http://localhost:3000/mobile-wrapper.html`, paste a JWT and optional metadata, then click **Launch Chat** to open the widget exactly as the mobile app would. The wrapper injects the token/metadata into the iframe query params so the frontend can forward the JWT to AgentOS + MCP tools.

## Installation

```bash
# Install JS deps
pnpm install

# Install Python deps
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Running Locally

1. **Backend** – FastAPI, Agno AgentOS, and FastMCP run in the same process:

   ```bash
   cd backend && source .venv/bin/activate
   python -m app.main
   ```

   The Agno agent autostarts a local FastMCP server (stdio transport) with mock wallet/ticket tools and mounts AG‑UI at `http://localhost:8000/agui`.

2. **Frontend** – CopilotKit widget + API route proxy:
   ```bash
   cd frontend
   pnpm dev
   ```
   CopilotKit’s runtime is exposed at `/api/copilotkit` and forwards requests to the backend AG‑UI interface while injecting the mobile JWT header.

## Testing

- Backend: `cd backend && pytest` (JWT middleware, in-memory Mongo stub, dummy MCP server).
- Frontend: `pnpm storybook` for widget QA (integration tests forthcoming).
- Manual E2E: run both services, open `mobile-wrapper.html`, send prompts such as “Show my balance” or “Raise a ticket”.

## Documentation

- `docs/prd.md` – product requirements (MVP scope)
- `docs/user-journeys.md` – key conversational flows
- `docs/architecture.md` – component + dataflow overview (kept in sync with implementation)
- `docs/milestones.md` – implementation roadmap + status
- `docs/decisions.md` – running log of engineering decisions + rationale

## Current Status

- ✅ Backend AgentOS upgraded to OpenAI SDK `2.8.1` and uses official AG-UI interface with FastMCP dummy tools.
- ✅ Frontend session bootstrap decodes JWT locally and forwards headers to CopilotKit requests.
- ✅ AG-UI widgets validated through shared Zod/Pydantic schemas; renderer supports balances, transactions, ticket form/status, confirmation.
- 🚧 Pending: production MCP backends, ticket creation workflows, integration/E2E tests, observability dashboards.
