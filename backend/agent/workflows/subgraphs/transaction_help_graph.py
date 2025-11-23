"""Transaction help workflow as LangGraph subgraph."""

from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import AIMessage, HumanMessage
from engine.state import AgentState
from agent.tools import get_transaction_details
from copilotkit.langgraph import copilotkit_emit_message


async def summarize_transaction_node(state: AgentState, config: RunnableConfig):
    """Step 1: Get transaction details and summarize."""
    messages = state.get("messages", [])
    transaction_id = ""
    
    # Extract transaction ID from recent messages
    for msg in reversed(messages[-5:]):
        content = str(msg.content).lower()
        if "txn_" in content:
            import re
            match = re.search(r'txn_\d+', content)
            if match:
                transaction_id = match.group(0)
                break
    
    # Call tool directly (in production, this would go through ToolNode)
    try:
        transaction = get_transaction_details.invoke({
            "user_id": state.get("user_id", "demo_user"),
            "transaction_id": transaction_id
        })
    except Exception:
        # Fallback
        from datetime import datetime, timedelta
        transaction = {
            "id": "txn_1",
            "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "merchant": "Coffee Shop",
            "amount": -50.0,
            "currency": "USD",
            "status": "completed",
            "reference": "532300764753"
        }
    
    # Update state with transaction context
    state["transaction_context"] = transaction
    state["current_workflow"] = "transaction_help"
    state["workflow_step"] = "summarized"
    
    # Format summary message
    amount = abs(transaction.get("amount", 0))
    currency = transaction.get("currency", "USD")
    merchant = transaction.get("merchant", "merchant")
    date = transaction.get("date", "")
    
    from datetime import datetime
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = date_obj.strftime("%d %b %Y")
    except:
        formatted_date = date
    
    summary_msg = f"Good news: your payment of {amount:.2f} {currency} to {merchant} on {formatted_date} was successful.\n\nUTR: {transaction.get('reference', 'N/A')}\n\nTell us what's wrong"
    
    # Add summary message
    state["messages"].append(AIMessage(content=summary_msg))
    await copilotkit_emit_message(config, summary_msg)
    
    return state


async def provide_guidance_node(state: AgentState, config: RunnableConfig):
    """Step 2: Provide resolution guidance based on issue type."""
    messages = state.get("messages", [])
    transaction = state.get("transaction_context", {})
    
    # Extract issue from last user message
    issue_type = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            issue_type = str(msg.content)
            break
    
    # Get guidance based on issue
    merchant = transaction.get("merchant", "the merchant")
    reference = transaction.get("reference", "")
    
    guides = {
        "receiver has not received": {
            "message": f"We hate it when that happens too. Here's what you can do: contact {merchant} with UTR: {reference}. Only the merchant can initiate refunds.",
            "steps": [f"Contact {merchant} directly", f"Provide UTR: {reference}", "Request payment confirmation or refund"]
        },
        "amount debited twice": {
            "message": f"Check if one transaction is still pending. If both are completed, contact {merchant} with UTR: {reference}.",
            "steps": ["Check transaction history", "Verify if one is pending", f"If both completed, contact {merchant}"]
        },
        "transaction failed": {
            "message": f"This usually auto-reverses in 24-48 hours. If not, contact {merchant} with UTR: {reference}.",
            "steps": ["Wait 24-48 hours", f"If not reversed, contact {merchant}", "Provide transaction details"]
        },
        "need refund": {
            "message": f"Contact {merchant} directly with UTR: {reference} to request refund.",
            "steps": [f"Contact {merchant} customer support", f"Provide UTR: {reference}", "Request refund"]
        },
        "wrong amount": {
            "message": f"Contact {merchant} with UTR: {reference} to dispute the charge.",
            "steps": [f"Contact {merchant} billing", f"Provide UTR: {reference}", "Request correction"]
        },
        "offer not applied": {
            "message": f"Contact {merchant} or check offer terms. UTR: {reference}",
            "steps": ["Review offer terms", f"Contact {merchant}", "Verify eligibility"]
        }
    }
    
    # Find matching guide
    issue_lower = issue_type.lower()
    guide = None
    for key, g in guides.items():
        if key in issue_lower:
            guide = g
            break
    
    if not guide:
        guide = {
            "message": f"Contact {merchant} with UTR: {reference} for assistance.",
            "steps": [f"Contact {merchant} customer support", f"Provide UTR: {reference}"]
        }
    
    # Create guidance message
    guidance_msg = f"{guide['message']}\n\nSteps:\n" + "\n".join(f"{i+1}. {step}" for i, step in enumerate(guide['steps']))
    
    state["workflow_step"] = "guided"
    state["issue_type"] = issue_type
    state["messages"].append(AIMessage(content=guidance_msg))
    await copilotkit_emit_message(config, guidance_msg)
    
    return state


def route_after_guidance(state: AgentState):
    """Route after providing guidance - check if escalation needed."""
    messages = state.get("messages", [])
    last_msg = messages[-1] if messages else None
    
    if isinstance(last_msg, HumanMessage):
        content = str(last_msg.content).lower()
        # Check if user wants to escalate
        if any(kw in content for kw in ["create ticket", "raise ticket", "escalate", "not resolved", "still having"]):
            return "escalate"
    
    return END


def build_transaction_help_subgraph():
    """Build and compile the transaction help subgraph."""
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("summarize", summarize_transaction_node)
    graph.add_node("provide_guidance", provide_guidance_node)
    
    # Add edges
    graph.add_edge(START, "summarize")
    graph.add_edge("summarize", END)  # After summarize, return to main graph for user response
    
    return graph.compile()

