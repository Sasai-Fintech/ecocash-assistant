"""Ecocash‑specific tool definitions.

These are simple placeholders – you can flesh them out later with real
database calls or external APIs. The important part is that they are
registered with CopilotKit so the frontend can invoke them.
"""

from typing import List, Dict
from langchain.tools import tool

@tool
def get_balance(user_id: str) -> float:
    """Return the current wallet balance for the given user."""
    # Placeholder implementation – replace with real logic later
    return 1234.56

@tool
def list_transactions(user_id: str, limit: int = 10) -> List[Dict]:
    """Return the most recent transactions for the user."""
    # Placeholder data
    return [
        {"id": "txn_1", "amount": -50.0, "description": "Coffee"},
        {"id": "txn_2", "amount": 200.0, "description": "Salary"},
    ][:limit]

@tool
def create_ticket(user_id: str, subject: str, body: str) -> str:
    """Create a support ticket and return its ID."""
    # Placeholder – in a real system you’d call a ticketing service
    return "TICKET-12345"
