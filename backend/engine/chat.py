import json
from engine.state import AgentState
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import AIMessage
from typing import cast

# Import Ecocash tools
from agent.tools import get_balance, list_transactions, create_ticket

# Lazy initialization to avoid import-time errors
_llm = None

def get_llm():
    """Get or create the LLM instance."""
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(model="gpt-4-turbo-preview")
    return _llm

async def chat_node(state: AgentState, config: RunnableConfig):
    """Handle chat operations for Ecocash Assistant"""
    
    # Get LLM instance (lazy initialization)
    llm = get_llm()
    
    # Bind the Ecocash tools to the LLM
    llm_with_tools = llm.bind_tools(
        [get_balance, list_transactions, create_ticket],
        parallel_tool_calls=False,
    )

    system_message = """
    You are the Ecocash Assistant, a helpful AI relationship manager for Ecocash fintech services.
    Your goal is to assist users with their wallet, transactions, and support tickets.
    
    Capabilities:
    1. Check wallet balance (get_balance) - This will display a balance card widget
    2. View recent transactions (list_transactions) - This will display a transaction table widget
    3. Create support tickets (create_ticket) - This will show a confirmation dialog before creating
    
    Guidelines:
    - Be professional, concise, and helpful.
    - When a user asks about their balance, ALWAYS call the get_balance tool. The tool will automatically display a balance widget.
    - When a user asks about transactions or wants to see their transaction history, ALWAYS call the list_transactions tool. The tool will automatically display a transaction table widget.
    - When a user reports an issue or wants to create a ticket, call the create_ticket tool with:
      * subject: A clear, concise summary of the issue (extracted from the user's message)
      * body: A detailed description of the problem (extracted from the user's message)
      * Example: If user says "my last transaction has issue. money is debited but merchant did not receive money", 
        use subject="Transaction payment issue" and body="Money was debited from account but merchant did not receive payment. Last transaction details: [include relevant transaction info if available]"
    - The create_ticket tool will show a confirmation dialog first - wait for user confirmation before proceeding.
    - After calling a tool, provide a brief conversational summary. The widgets will render automatically.
    - Do not make up data; always use the tools provided.
    - For balance queries, use user_id="demo_user" (in production, this would come from authentication).
    """

    # calling ainvoke instead of invoke is essential to get streaming to work properly on tool calls.
    response = await llm_with_tools.ainvoke(
        [
            SystemMessage(content=system_message),
            *state["messages"]
        ],
        config=config,
    )

    return {
        "messages": [response],
    }
