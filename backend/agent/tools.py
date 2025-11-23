"""Ecocash‑specific tool definitions.

These tools are called by the agent and their return values are automatically
passed to the frontend widget render functions via CopilotKit actions.
"""

from typing import List, Dict
from langchain.tools import tool

@tool
def get_balance(user_id: str) -> float:
    """Get the current wallet balance for the given user.
    
    Returns the balance amount which will be displayed in a balance card widget.
    """
    # Placeholder implementation – replace with real logic later
    # In production, this would query a database or API
    return 1234.56

@tool
def list_transactions(user_id: str, limit: int = 10) -> List[Dict]:
    """List the most recent transactions for the user.
    
    Returns a list of transaction dictionaries that will be displayed in a transaction table widget.
    Each transaction should have: id, date, merchant/description, amount, currency.
    """
    # Placeholder data – replace with real database/API calls
    from datetime import datetime, timedelta
    
    return [
        {
            "id": "txn_1",
            "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "merchant": "Coffee Shop",
            "description": "Coffee",
            "amount": -50.0,
            "currency": "USD"
        },
        {
            "id": "txn_2",
            "date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            "merchant": "Employer",
            "description": "Salary",
            "amount": 2000.0,
            "currency": "USD"
        },
        {
            "id": "txn_3",
            "date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
            "merchant": "Grocery Store",
            "description": "Groceries",
            "amount": -125.50,
            "currency": "USD"
        },
    ][:limit]

@tool
def get_transaction_details(user_id: str, transaction_id: str = "") -> Dict:
    """Get detailed information about a specific transaction.
    
    This helps provide a summary when user asks for help with a transaction.
    If transaction_id is provided, fetch that specific transaction.
    If not provided, returns the most recent transaction.
    Returns transaction details including merchant, date, amount, status, and UTR/reference number.
    """
    # Placeholder implementation – in production, this would query a database or API
    from datetime import datetime, timedelta
    import random
    
    # Mock transaction details - in production, fetch by transaction_id or user's description
    transactions = [
        {
            "id": "txn_1",
            "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "merchant": "Coffee Shop",
            "description": "Coffee",
            "amount": -50.0,
            "currency": "USD",
            "status": "completed",
            "reference": "532300764753"  # UTR format
        },
        {
            "id": "txn_2",
            "date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            "merchant": "Employer",
            "description": "Salary",
            "amount": 2000.0,
            "currency": "USD",
            "status": "completed",
            "reference": "532300764754"
        },
        {
            "id": "txn_3",
            "date": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d"),
            "merchant": "Grocery Store",
            "description": "Groceries",
            "amount": -125.50,
            "currency": "USD",
            "status": "completed",
            "reference": "532300764755"
        },
    ]
    
    # Find transaction by ID if provided
    if transaction_id:
        transaction = next((t for t in transactions if t["id"] == transaction_id), None)
        if transaction:
            return transaction
    
    # Return most recent transaction (first in list) as fallback
    return transactions[0] if transactions else {}

@tool
def create_ticket(user_id: str, subject: str, body: str) -> str:
    """Create a support ticket for the user.
    
    This will trigger a confirmation widget (human-in-the-loop) before creating the ticket.
    Returns a message with the ticket ID after confirmation.
    """
    # Placeholder – in a real system you'd call a ticketing service
    # The actual creation happens after user confirmation via the widget
    import random
    ticket_id = f"TICKET-{random.randint(10000, 99999)}"
    # Return message with ticket ID in a consistent format for easy parsing
    return f"Support ticket {ticket_id} created successfully. Our team will get back to you soon."
