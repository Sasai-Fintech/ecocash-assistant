from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent

from agent.graph import build_graph

app = FastAPI(title="Ecocash Assistant Backend")

# Build the graph
graph = build_graph()

# Create the remote endpoint
sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAgent(
            name="ecocash_agent",
            description="Ecocash Relationship Manager",
            agent=graph,
        )
    ],
)

# Add the endpoint
add_fastapi_endpoint(app, sdk, "/api/copilotkit")

@app.get("/")
async def root():
    return {"message": "Ecocash Assistant Backend is running"}
