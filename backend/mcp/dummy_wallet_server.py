"""
FastMCP v2 server that exposes mock wallet + ticket tools for Eco Assist.

This server can be launched via STDIO (default) so Agno's MCPTools can connect
using the `command` parameter. It returns deterministic dummy data that mirrors
the structures the real wallet/ticket MCP will provide later.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from fastmcp import FastMCP


server = FastMCP(
  name="EcoWalletMCP",
  instructions="Mock wallet + support data for Eco Assist development environments.",
  version="0.1.0",
)


BASE_BALANCES = {
  "retail-123": [
    {
      "account_id": "WALLET_USD",
      "label": "EcoCash USD Wallet",
      "currency": "USD",
      "balance": 245.55,
      "available": 200.10,
      "limit": 1000.0,
      "deeplink": "ecocash://wallet/usd",
    },
    {
      "account_id": "WALLET_ZWL",
      "label": "EcoCash ZWL Wallet",
      "currency": "ZWL",
      "balance": 1500.0,
      "available": 1490.0,
      "limit": 5000.0,
      "deeplink": "ecocash://wallet/zwl",
    },
  ]
}

BASE_TRANSACTIONS = {
  "retail-123": [
    {
      "id": "txn-001",
      "description": "Merchant payment - OK Mart",
      "amount": -45.2,
      "currency": "USD",
      "status": "completed",
      "category": "merchant_payment",
      "deeplink": "ecocash://transactions/txn-001",
      "posted_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
    },
    {
      "id": "txn-002",
      "description": "Wallet top-up",
      "amount": 120.0,
      "currency": "USD",
      "status": "completed",
      "category": "topup",
      "deeplink": "ecocash://transactions/txn-002",
      "posted_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
    },
    {
      "id": "txn-003",
      "description": "P2P transfer to +263771000999",
      "amount": -30.0,
      "currency": "USD",
      "status": "pending",
      "category": "p2p",
      "deeplink": "ecocash://transactions/txn-003",
      "posted_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
    },
  ]
}

TICKETS: dict[str, dict[str, Any]] = {
  "TCK-1001": {
    "id": "TCK-1001",
    "user_id": "retail-123",
    "status": "in_progress",
    "summary": "Merchant payment pending confirmation",
    "last_update": (datetime.utcnow() - timedelta(hours=6)).isoformat(),
  }
}


def _ensure_user(user_id: str):
  BASE_BALANCES.setdefault(user_id, BASE_BALANCES["retail-123"])
  BASE_TRANSACTIONS.setdefault(user_id, BASE_TRANSACTIONS["retail-123"])


@server.tool(name="get_balances", description="Return wallet balances for a user.")
async def get_balances(user_id: str) -> dict[str, Any]:
  _ensure_user(user_id)
  return {"user_id": user_id, "accounts": BASE_BALANCES[user_id]}


@server.tool(name="get_transactions", description="Return last N transactions for a user.")
async def get_transactions(user_id: str, limit: int = 5) -> dict[str, Any]:
  _ensure_user(user_id)
  return {"user_id": user_id, "transactions": BASE_TRANSACTIONS[user_id][:limit]}


@server.tool(name="create_ticket", description="Create a mock support ticket.")
async def create_ticket(user_id: str, reason: str, transaction_id: str | None = None) -> dict[str, Any]:
  ticket_id = f"TCK-{len(TICKETS) + 1001}"
  TICKETS[ticket_id] = {
    "id": ticket_id,
    "user_id": user_id,
    "status": "new",
    "summary": reason,
    "transaction_id": transaction_id,
    "last_update": datetime.utcnow().isoformat(),
  }
  return TICKETS[ticket_id]


@server.tool(name="get_ticket_status", description="Fetch tickets for a user.")
async def get_ticket_status(user_id: str) -> dict[str, Any]:
  items = [ticket for ticket in TICKETS.values() if ticket["user_id"] == user_id]
  return {"user_id": user_id, "tickets": items}


if __name__ == "__main__":
  # FastMCP defaults to stdio transport which matches Agno's MCPTools expectations.
  server.run()

