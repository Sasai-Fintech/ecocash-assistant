import os
import sys
from pathlib import Path
from typing import List

import dotenv
from agno.agent.agent import Agent
from agno.os.app import AgentOS
from agno.os.middleware import JWTMiddleware
from agno.os.middleware.jwt import TokenSource
from agno.tools.mcp import MCPTools

from app.config import get_settings
from app.logger import get_logger

from .mongo import build_mongo_db

from .tools import frontend_actions

from agno.models.openai import OpenAIChat  # noqa: E402

dotenv.load_dotenv(Path(__file__).resolve().parents[2] / "configs" / ".env")
settings = get_settings()
logger = get_logger(__name__)

def build_agents(db) -> List[Agent]:
  mcp_script = Path(__file__).resolve().parents[1] / "mcp" / "dummy_wallet_server.py"
  mcp_env = {**os.environ, "PYTHONUNBUFFERED": "1"}
  mcp_tools = MCPTools(
    command=f"{sys.executable} {mcp_script}",
    env=mcp_env,
    timeout_seconds=20,
    tool_name_prefix="eco",
  )

  eco_agent = Agent(
    name="Eco Assist Relationship Manager",
    description="Helps EcoCash customers with balances, transactions, and support tickets.",
    instructions=(
      "1. Use the eco_* MCP tools to retrieve accurate balances, transactions, and tickets.\n"
      "2. Respond with a short conversational summary before or after rendering UI.\n"
      "3. For any structured data, call the render_widget tool with a valid WidgetPayload "
      "(balance_card, transaction_table, ticket_form, confirmation_dialog, ticket_status_board).\n"
      "4. If an action is sensitive or requires user confirmation, call request_confirmation with "
      "a summary before executing the MCP mutation.\n"
      "5. Always keep widget payloads schema-compliant and include deeplinks/postback payloads "
      "to blend tap and text interactions.\n"
      "6. When showing a transaction_table, include an `actions` array that contains at least one "
      "button labeled \"Get help\" (action=postback, payload {\"type\":\"transaction_help\",\"transactionId\":\"<txn_id>\"}).\n"
      "7. When the user taps or asks for help on a transaction, render a confirmation/summary widget that "
      "highlights merchant, amount, time, and offer tap-able options such as \"Amount debited\", "
      "\"Issue with offer\", \"Refund issues\" similar to the provided UX reference."
    ),
    model=OpenAIChat(id=settings.agno_model_id),
    tools=[
      mcp_tools,
      frontend_actions.render_widget,
      frontend_actions.request_confirmation,
    ],
    store_events=True,
    db=db,
  )
  return [eco_agent]

def build_agent_os(base_app=None, db=None) -> AgentOS:
  agents = build_agents(db or build_mongo_db())
  interfaces: List[object] = []

  try:
    from agno.os.interfaces.agui import AGUI

    interfaces.append(AGUI(agent=agents[0], prefix="", tags=["AGUI"]))
  except ModuleNotFoundError as exc:
    logger.warning(
      "AG-UI package not installed; AGUI interface disabled. Install `ag_ui` to enable rich interface. %s",
      exc,
    )

  agent_os = AgentOS(
    id=settings.agno_app_id,
    name=settings.agno_app_name,
    description=settings.agno_app_description,
    version="0.1.0",
    agents=agents,
    interfaces=interfaces,
    base_app=base_app,
    on_route_conflict="preserve_base_app",
    telemetry=False,
  )

  return agent_os

