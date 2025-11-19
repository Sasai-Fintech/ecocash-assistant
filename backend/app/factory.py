from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agent import build_agent_os
from agent.mongo import build_mongo_db

from .config import get_settings
from .middleware import register_mobile_token_middleware


def create_app() -> FastAPI:
  settings = get_settings()
  base_app = FastAPI(
    title="Ecocash Assistant Backend",
    version="0.1.0",
    description="AgentOS runtime",
  )

  base_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.environment == "development" else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
  )

  register_mobile_token_middleware(base_app)

  agent_os = build_agent_os(base_app=base_app, db=build_mongo_db())
  return agent_os.get_app()

