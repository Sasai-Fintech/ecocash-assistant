# EcoCash AI Assistant

An AI-powered conversational assistant for EcoCash fintech services, built with CopilotKit, LangGraph, and Next.js. The assistant helps users manage their wallet balances, view transactions, and create support tickets through natural language interactions.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend** (`/backend`): FastAPI server with LangGraph agent powered by OpenAI
- **Frontend** (`/frontend`): Next.js application with CopilotKit React components
- **Schemas** (`/packages/schemas`): Shared TypeScript/Zod schemas for type-safe widget communication

### Technology Stack

**Backend:**
- Python 3.12
- FastAPI
- LangGraph (agent orchestration)
- CopilotKit (AG-UI protocol)
- OpenAI GPT-4 Turbo
- Poetry (dependency management)

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- CopilotKit React
- Tailwind CSS
- Radix UI components

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 18+
- Poetry (for Python dependency management)
- npm or pnpm

### Environment Setup

1. **Backend Environment** (`backend/.env`):
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

2. **Frontend Environment** (`frontend/.env.local`):
```bash
OPENAI_API_KEY=your_openai_api_key_here
REMOTE_ACTION_URL=http://localhost:8000/api/copilotkit
```

### Installation & Running

#### Option 1: Using the Start Script (Recommended)

```bash
chmod +x start.sh
./start.sh
```

This will start both backend and frontend services automatically.

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Health Check**: http://localhost:8000/

## 📁 Project Structure

```
ecocash-assistant/
├── backend/                 # Python FastAPI backend
│   ├── agent/              # LangGraph agent definition
│   │   ├── graph.py       # Agent workflow graph
│   │   └── tools.py       # Agent tools (placeholder implementations)
│   ├── app/                # FastAPI application
│   │   └── main.py        # FastAPI entry point
│   ├── engine/             # Agent engine components
│   │   ├── chat.py        # Chat node implementation
│   │   └── state.py       # Agent state definitions
│   ├── mcp/                # MCP tools (future integration)
│   └── pyproject.toml      # Poetry dependencies
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app directory
│   │   ├── page.tsx       # Main chat interface
│   │   └── api/            # API routes
│   │       └── copilotkit/ # CopilotKit runtime endpoint
│   ├── components/         # React components
│   │   ├── widgets/        # AG-UI widget components
│   │   └── ui/             # Radix UI primitives
│   └── lib/                # Utilities and types
├── packages/
│   └── schemas/            # Shared TypeScript schemas
├── docs/                   # Project documentation
│   ├── prd.md             # Product Requirements Document
│   ├── architecture.md    # Architecture overview
│   ├── milestones.md      # Implementation milestones
│   └── user-journeys.md   # User journey definitions
└── start.sh               # Convenience startup script
```

## 🎯 Features

### Current Capabilities

1. **Balance Checking**: Query wallet balances through natural language
2. **Transaction History**: View recent transactions with structured data
3. **Support Tickets**: Create support tickets with human-in-the-loop confirmation
4. **Conversational Interface**: Natural language interactions powered by GPT-4

### Agent Tools

The backend agent exposes the following tools:

- `get_balance(user_id: str)`: Retrieve wallet balance
- `list_transactions(user_id: str, limit: int)`: List recent transactions
- `create_ticket(user_id: str, subject: str, body: str)`: Create a support ticket

### Widget Components

The frontend includes reusable widget components:

- `BalanceCard`: Displays wallet balance with currency formatting
- `TransactionTable`: Shows transaction history in a table format
- `TicketConfirmation`: Human-in-the-loop confirmation dialog

## 🔧 Development

### Backend Development

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

The backend uses LangGraph for agent orchestration. The agent graph is defined in `backend/agent/graph.py` and uses nodes from `backend/engine/chat.py`.

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend uses CopilotKit for the chat interface. The main chat component is in `frontend/app/page.tsx`.

### Schema Package

The shared schemas package provides type-safe communication between frontend and backend:

```bash
cd packages/schemas
npm install
npm run build
```

## 📚 Documentation

- [Product Requirements Document](./docs/prd.md)
- [Architecture Overview](./docs/architecture.md)
- [Implementation Milestones](./docs/milestones.md)
- [User Journeys](./docs/user-journeys.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 🧪 Testing

Currently, the project uses placeholder implementations for tools. In production, these would connect to:

- Real wallet/balance APIs
- Transaction databases
- Ticket management systems
- MCP (Model Context Protocol) servers

## 🔐 Security Notes

- Environment variables should never be committed to version control
- JWT validation should be implemented for production use
- Rate limiting should be added for API endpoints
- All sensitive operations require human-in-the-loop confirmation

## 🚧 Roadmap

See [milestones.md](./docs/milestones.md) for detailed implementation roadmap:

- ✅ Milestone 1: Foundations & Architecture
- 🚧 Milestone 2: CopilotKit Widget & UX
- 🚧 Milestone 3: Agno AgentOS Backend
- ⏳ Milestone 4: Ticket Workflow & Human-in-loop
- ⏳ Milestone 5: Quality, Compliance & Launch

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contributing guidelines here]

