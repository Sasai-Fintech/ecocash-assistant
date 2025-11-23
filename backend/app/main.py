from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitRemoteEndpoint, LangGraphAgent
import logging

from agent.graph import build_graph, get_checkpointer
from app.sessions import router as sessions_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Ecocash Assistant Backend")

# Add CORS middleware to allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include sessions router
app.include_router(sessions_router)

# Initialize graph and SDK - will be set up in startup event
# We start with MemorySaver, then upgrade to AsyncPostgresSaver in startup
from langgraph.checkpoint.memory import MemorySaver
graph = build_graph(checkpointer=MemorySaver())
sdk = CopilotKitRemoteEndpoint(
    agents=[
        LangGraphAgent(
            name="ecocash_agent",
            description="Ecocash Relationship Manager",
            agent=graph,
        )
    ],
)

# Register endpoint initially (will use MemorySaver until startup completes)
add_fastapi_endpoint(app, sdk, "/api/copilotkit")

@app.on_event("startup")
async def startup_event():
    """Initialize PostgreSQL checkpointer and rebuild graph on FastAPI startup.
    
    Note: The endpoint is already registered, but we rebuild the graph with
    the proper async checkpointer. The SDK will use the new graph instance.
    """
    global graph, sdk
    
    try:
        # Initialize async checkpointer
        print("[STARTUP] Initializing checkpointer...")
        checkpointer = await get_checkpointer()
        print(f"[STARTUP] Checkpointer initialized: {type(checkpointer).__name__}")
        
        # Rebuild graph with proper checkpointer
        graph = build_graph(checkpointer=checkpointer)
        print("[STARTUP] Graph rebuilt with checkpointer")
        
        # Update SDK with new graph (this updates the agent reference)
        # Note: The endpoint is already registered, but the SDK will use the new graph
        sdk = CopilotKitRemoteEndpoint(
            agents=[
                LangGraphAgent(
                    name="ecocash_agent",
                    description="Ecocash Relationship Manager",
                    agent=graph,
                )
            ],
        )
        
        # Re-register endpoint with updated SDK
        # Remove old route and add new one
        app.router.routes = [r for r in app.router.routes if r.path != "/api/copilotkit"]
        add_fastapi_endpoint(app, sdk, "/api/copilotkit")
        
        logger.info("✅ Graph rebuilt with AsyncPostgresSaver checkpointer")
    except Exception as e:
        logger.error(f"Failed to initialize checkpointer in startup: {e}", exc_info=True)
        logger.warning("Continuing with MemorySaver - sessions will not persist")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up checkpointer on FastAPI shutdown."""
    from agent.graph import _checkpointer_cm
    if _checkpointer_cm is not None:
        try:
            await _checkpointer_cm.__aexit__(None, None, None)
            logger.info("✅ Checkpointer context manager closed")
        except Exception as e:
            logger.error(f"Error closing checkpointer: {e}")

@app.get("/")
async def root():
    return {"message": "Ecocash Assistant Backend is running"}
