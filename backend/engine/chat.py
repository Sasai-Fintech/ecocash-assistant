import json
from engine.state import AgentState
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from langchain_core.messages import AIMessage
from typing import cast

# Import Ecocash tools
from agent.tools import get_balance, list_transactions, create_ticket

llm = ChatOpenAI(model="gpt-4-turbo-preview")

async def chat_node(state: AgentState, config: RunnableConfig):
    """Handle chat operations for Ecocash Assistant"""
    
    # Bind the Ecocash tools to the LLM
    llm_with_tools = llm.bind_tools(
        [get_balance, list_transactions, create_ticket],
        parallel_tool_calls=False,
    )

    system_message = """
    You are the Ecocash Assistant, a helpful AI relationship manager for Ecocash fintech services.
    Your goal is to assist users with their wallet, transactions, and support tickets.
    
    Capabilities:
    1. Check wallet balance (get_balance)
    2. View recent transactions (list_transactions)
    3. Create support tickets (create_ticket)
    
    Guidelines:
    - Be professional, concise, and helpful.
    - If a user asks about their balance or transactions, use the appropriate tool.
    - If a user reports an issue, offer to create a ticket.
    - Do not make up data; use the tools provided.
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
