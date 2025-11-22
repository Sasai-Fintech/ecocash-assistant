"""
Ecocash Agent Graph.
Defines the workflow for the Ecocash Assistant.
"""

from typing import cast
from langchain_core.messages import AIMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

# Import Ecocash chat node
from engine.chat import chat_node
from engine.state import AgentState

# Import Ecocash tools
from agent.tools import get_balance, list_transactions, create_ticket

# ----------------------------------------------------------------------
# Build the graph
# ----------------------------------------------------------------------
graph_builder = StateGraph(AgentState)

# Add nodes
graph_builder.add_node("chat_node", chat_node)
graph_builder.add_node("ecocash_tools", ToolNode([get_balance, list_transactions, create_ticket]))

# Define routing logic
def route(state: AgentState):
    messages = state.get("messages", [])
    if messages and isinstance(messages[-1], AIMessage):
        ai_msg = cast(AIMessage, messages[-1])
        if ai_msg.tool_calls:
            # If any tool is called, route to tools
            return "ecocash_tools"
    return END

# Add edges
graph_builder.add_edge(START, "chat_node")
graph_builder.add_conditional_edges(
    "chat_node",
    route,
    {"ecocash_tools": "ecocash_tools", END: END}
)
graph_builder.add_edge("ecocash_tools", "chat_node")

# Compile graph
def build_graph():
    return graph_builder.compile(
        checkpointer=MemorySaver(),
    )
