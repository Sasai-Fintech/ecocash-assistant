"""
Ecocash Agent Graph.
Defines the workflow for the Ecocash Assistant.
"""

from typing import cast
from langchain_core.messages import AIMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.runnables import RunnableConfig
from copilotkit.langgraph import copilotkit_emit_message

# Import Ecocash chat node
from engine.chat import chat_node
from engine.state import AgentState

# Import Ecocash tools
from agent.tools import get_balance, list_transactions, create_ticket, get_transaction_details

# Node for ticket confirmation (human-in-the-loop)
async def ticket_confirmation_node(state: AgentState, config: RunnableConfig):
    """Shows confirmation dialog and waits for user response."""
    return state

# Node to perform ticket creation after confirmation
async def perform_ticket_node(state: AgentState, config: RunnableConfig):
    """Execute ticket creation after user confirmation."""
    messages = state.get("messages", [])
    
    # Get the tool message (user's confirmation response)
    tool_message = None
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage):
            tool_message = msg
            break
    
    # Get the AI message with tool call
    ai_message = None
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and msg.tool_calls:
            ai_message = msg
            break
    
    if tool_message and ai_message:
        # Check if user cancelled
        if tool_message.content == "CANCEL":
            cancel_msg = AIMessage(content="Ticket creation cancelled. Is there anything else I can help you with?")
            state["messages"].append(cancel_msg)
            await copilotkit_emit_message(config, cancel_msg.content)
            return state
        
        # User confirmed - proceed with ticket creation
        if tool_message.content == "CONFIRM" or tool_message.content.startswith("CONFIRM"):
            # Execute the actual ticket creation
            tool_node = ToolNode([create_ticket])
            result_state = await tool_node.ainvoke(state, config)
            
            # Get the ticket result
            tool_messages = [msg for msg in result_state.get("messages", []) if isinstance(msg, ToolMessage)]
            if tool_messages:
                ticket_result = tool_messages[-1].content
                
                # Extract ticket ID from the result (format: "Support ticket TICKET-12345 created...")
                import re
                ticket_id_match = re.search(r'TICKET-\d+', ticket_result)
                ticket_id = ticket_id_match.group(0) if ticket_id_match else "N/A"
                
                # Create a clear success message with prominent ticket ID
                # This helps the suggestions system detect completion and gives user confidence
                success_msg = AIMessage(
                    content=f"✅ Your support request has been successfully submitted!\n\n"
                           f"📋 Ticket ID: {ticket_id}\n\n"
                           f"Please save this ticket ID for your records. You can use it to track the status of your request. "
                           f"Our support team will review your request and get back to you shortly. "
                           f"Is there anything else I can help you with?"
                )
                result_state["messages"].append(success_msg)
                await copilotkit_emit_message(config, success_msg.content)
            
            return result_state
    
    return state

# ----------------------------------------------------------------------
# Build the graph
# ----------------------------------------------------------------------
graph_builder = StateGraph(AgentState)

# Add nodes
graph_builder.add_node("chat_node", chat_node)
graph_builder.add_node("ecocash_tools", ToolNode([get_balance, list_transactions, create_ticket, get_transaction_details]))
graph_builder.add_node("ticket_confirmation", ticket_confirmation_node)
graph_builder.add_node("perform_ticket", perform_ticket_node)

# Define routing logic after chat node
def route_after_chat(state: AgentState):
    messages = state.get("messages", [])
    if messages and isinstance(messages[-1], AIMessage):
        ai_msg = cast(AIMessage, messages[-1])
        if ai_msg.tool_calls:
            tool_name = ai_msg.tool_calls[0]["name"]
            # Route to ticket confirmation for create_ticket
            if tool_name == "create_ticket":
                return "ticket_confirmation"
            # Route to tools for other tools
            return "ecocash_tools"
    return END

# Define routing logic after ticket confirmation
def route_after_confirmation(state: AgentState):
    messages = state.get("messages", [])
    # After interrupt, user response comes as a ToolMessage
    if messages and isinstance(messages[-1], ToolMessage):
        tool_msg = cast(ToolMessage, messages[-1])
        # Check if this is a confirmation response
        if tool_msg.content in ["CONFIRM", "CANCEL"] or tool_msg.content.startswith("CONFIRM"):
            return "perform_ticket"
    return END

# Add edges
graph_builder.add_edge(START, "chat_node")
graph_builder.add_conditional_edges(
    "chat_node",
    route_after_chat,
    {"ecocash_tools": "ecocash_tools", "ticket_confirmation": "ticket_confirmation", END: END}
)
graph_builder.add_edge("ecocash_tools", "chat_node")
graph_builder.add_conditional_edges(
    "ticket_confirmation",
    route_after_confirmation,
    {"perform_ticket": "perform_ticket", END: END}
)
graph_builder.add_edge("perform_ticket", "chat_node")

# Compile graph with interrupt for human-in-the-loop
def build_graph():
    return graph_builder.compile(
        interrupt_after=["ticket_confirmation"],
        checkpointer=MemorySaver(),
    )
