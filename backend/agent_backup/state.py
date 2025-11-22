from typing import Annotated, List, Sequence, TypedDict, Union
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """State for the Ecocash agent."""
    messages: Annotated[list, add_messages]
    user_id: str
    session_id: str
