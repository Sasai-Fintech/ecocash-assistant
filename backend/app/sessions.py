"""
Session management API endpoints.
Queries sessions (threads) from the PostgreSQL checkpointer.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import logging

from agent.graph import get_checkpointer, build_graph

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


class SessionInfo(BaseModel):
    """Session information model."""
    thread_id: str
    title: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_message: Optional[str] = None
    message_count: int = 0


@router.get("/debug")
async def debug_sessions():
    """Debug endpoint to check database state."""
    try:
        import asyncpg
        from urllib.parse import urlparse
        import os
        
        postgres_uri = os.getenv("POSTGRES_URI")
        if not postgres_uri:
            return {"error": "POSTGRES_URI not set"}
        
        parsed = urlparse(postgres_uri)
        conn = await asyncpg.connect(
            host=parsed.hostname or "localhost",
            port=parsed.port or 5432,
            database=parsed.path.lstrip("/") if parsed.path else "ecocash_assistant",
            user=parsed.username or "postgres",
            password=parsed.password or ""
        )
        
        try:
            # Get all thread IDs
            thread_ids = await conn.fetch("SELECT DISTINCT thread_id FROM checkpoints WHERE checkpoint_ns = ''")
            # Get total checkpoint count
            total = await conn.fetchval("SELECT COUNT(*) FROM checkpoints WHERE checkpoint_ns = ''")
            # Get latest checkpoint
            latest = await conn.fetchrow("""
                SELECT thread_id, checkpoint_id, checkpoint->>'ts' as timestamp
                FROM checkpoints 
                WHERE checkpoint_ns = ''
                ORDER BY checkpoint_id DESC 
                LIMIT 1
            """)
            
            return {
                "total_checkpoints": total,
                "unique_thread_ids": len(thread_ids),
                "thread_ids": [t['thread_id'] for t in thread_ids],
                "latest_checkpoint": dict(latest) if latest else None
            }
        finally:
            await conn.close()
    except Exception as e:
        return {"error": str(e)}


@router.get("/", response_model=List[SessionInfo])
async def list_sessions(user_id: Optional[str] = None, limit: int = 50):
    """
    List all sessions (threads) from the checkpointer.
    
    For PostgreSQL checkpointer, we query the database directly to get unique thread IDs
    and their latest checkpoints.
    
    Args:
        user_id: Optional user ID to filter sessions (for multi-user support)
        limit: Maximum number of sessions to return
    
    Returns:
        List of session information
    """
    print(f"[SESSIONS] list_sessions called - user_id: {user_id}, limit: {limit}")
    try:
        checkpointer = await get_checkpointer()
        print(f"[SESSIONS] Got checkpointer: {type(checkpointer)}")
        
        # Check if this is a PostgreSQL checkpointer (AsyncPostgresSaver)
        # AsyncPostgresSaver doesn't expose 'conn' directly, so we check the class name
        checkpointer_type = type(checkpointer).__name__
        is_postgres = 'Postgres' in checkpointer_type or 'postgres' in str(type(checkpointer))
        
        print(f"[SESSIONS] Checkpointer type: {checkpointer_type}, is_postgres: {is_postgres}")
        print(f"[SESSIONS] user_id filter: {user_id} (None means no filtering)")
        logger.info(f"Checkpointer type: {checkpointer_type}, is_postgres: {is_postgres}")
        
        # For PostgreSQL checkpointer, query the database directly
        if is_postgres:
            import asyncpg
            from urllib.parse import urlparse
            import os
            
            # Get connection string
            postgres_uri = os.getenv("POSTGRES_URI")
            if not postgres_uri:
                logger.warning("POSTGRES_URI not set, cannot query sessions")
                return []
            
            # Parse connection string
            parsed = urlparse(postgres_uri)
            
            # Connect to database
            conn = await asyncpg.connect(
                host=parsed.hostname or "localhost",
                port=parsed.port or 5432,
                database=parsed.path.lstrip("/") if parsed.path else "ecocash_assistant",
                user=parsed.username or "postgres",
                password=parsed.password or ""
            )
            
            try:
                # First, let's see what's actually in the database
                all_checkpoints_query = "SELECT thread_id, checkpoint_ns, COUNT(*) as cnt FROM checkpoints GROUP BY thread_id, checkpoint_ns;"
                all_rows = await conn.fetch(all_checkpoints_query)
                print(f"[SESSIONS] All checkpoints in DB: {[(r['thread_id'], r['checkpoint_ns'], r['cnt']) for r in all_rows]}")
                
                # Get unique thread IDs from database, ordered by most recent checkpoint
                # This ensures we get all sessions, not just one
                query = """
                    WITH latest_checkpoints AS (
                        SELECT DISTINCT ON (thread_id)
                            thread_id,
                            checkpoint_id
                        FROM checkpoints
                        WHERE checkpoint_ns = ''
                        ORDER BY thread_id, checkpoint_id DESC
                    )
                    SELECT thread_id
                    FROM latest_checkpoints
                    ORDER BY checkpoint_id DESC
                    LIMIT $1
                """
                
                thread_rows = await conn.fetch(query, limit)
                print(f"[SESSIONS] Found {len(thread_rows)} unique thread IDs in database")
                
                # Build graph to use aget_state() for proper deserialization
                graph = build_graph(checkpointer=checkpointer)
                
                sessions = []
                for row in thread_rows:
                    thread_id = row['thread_id']
                    
                    # Filter by user_id if provided
                    if user_id and user_id not in thread_id:
                        continue
                    
                    try:
                        # Use graph.aget_state() to get properly deserialized state
                        # This handles version 3.0.1+ checkpoint structure correctly
                        config = {"configurable": {"thread_id": thread_id}}
                        state = await graph.aget_state(config)
                        
                        if not state:
                            continue
                        
                        # Extract messages from state (properly deserialized)
                        messages = state.values.get("messages", [])
                        
                        # Extract last message
                        last_message = None
                        if messages:
                            last_msg = messages[-1]
                            if hasattr(last_msg, 'content'):
                                last_message = str(last_msg.content)[:100]
                            elif isinstance(last_msg, dict):
                                last_message = str(last_msg.get('content', ''))[:100]
                        
                        # Extract title from metadata or first message
                        title = state.metadata.get("title") if state.metadata else None
                        if not title and messages:
                            # Find first user message (HumanMessage)
                            first_user_msg = None
                            for m in messages:
                                # Check for HumanMessage type or role='user'
                                if hasattr(m, 'type') and m.type == 'human':
                                    first_user_msg = m
                                    break
                                elif hasattr(m, 'role') and m.role == 'user':
                                    first_user_msg = m
                                    break
                                elif isinstance(m, dict) and m.get('role') == 'user':
                                    first_user_msg = m
                                    break
                                # Also check for HumanMessage class name
                                elif 'HumanMessage' in str(type(m)):
                                    first_user_msg = m
                                    break
                            
                            if first_user_msg:
                                content = None
                                if hasattr(first_user_msg, 'content'):
                                    content = str(first_user_msg.content)
                                elif isinstance(first_user_msg, dict):
                                    content = str(first_user_msg.get('content', ''))
                                
                                if content:
                                    # Clean and truncate title
                                    title = content.replace('\n', ' ').strip()[:50]
                                    if len(content) > 50:
                                        title = title.rsplit(' ', 1)[0] + '...'  # Don't cut words
                        
                        # Get timestamps from metadata
                        created_at = None
                        if state.metadata:
                            created_at_raw = state.metadata.get("created_at")
                            if created_at_raw:
                                if isinstance(created_at_raw, str):
                                    try:
                                        created_at = datetime.fromisoformat(created_at_raw.replace('Z', '+00:00'))
                                    except:
                                        created_at = None
                                elif isinstance(created_at_raw, datetime):
                                    created_at = created_at_raw
                        
                        sessions.append(SessionInfo(
                            thread_id=thread_id,
                            title=title or f"Session {thread_id[:8]}",
                            created_at=created_at,
                            updated_at=created_at,
                            last_message=last_message,
                            message_count=len(messages)
                        ))
                    except Exception as e:
                        logger.warning(f"Failed to get state for thread {thread_id}: {e}")
                        # Fallback: create session with minimal info
                        sessions.append(SessionInfo(
                            thread_id=thread_id,
                            title=f"Session {thread_id[:8]}",
                            created_at=None,
                            updated_at=None,
                            last_message=None,
                            message_count=0
                        ))
                
                # Sort by updated_at (most recent first)
                sessions.sort(key=lambda x: x.updated_at or datetime.min, reverse=True)
                
                print(f"[SESSIONS] Returning {len(sessions)} sessions")
                return sessions[:limit]
            
            finally:
                await conn.close()
        
        # Fallback: Try using checkpointer's list method (for MemorySaver or other checkpointers)
        if hasattr(checkpointer, 'alist'):
            print("[SESSIONS] Using checkpointer.alist() method (MemorySaver or other)")
            logger.warning("Using checkpointer.alist() - may be slow for many sessions")
            threads = {}
            
            async for checkpoint in checkpointer.alist(
                config={"configurable": {}},
                limit=limit * 10
            ):
                thread_id = checkpoint.config.get("configurable", {}).get("thread_id")
                if not thread_id:
                    continue
                
                if user_id and user_id not in thread_id:
                    continue
                
                if thread_id not in threads:
                    threads[thread_id] = checkpoint
            
            sessions = []
            for thread_id, checkpoint in list(threads.items())[:limit]:
                state = checkpoint.values if hasattr(checkpoint, 'values') else {}
                messages = state.get("messages", [])
                
                last_message = None
                if messages:
                    last_msg = messages[-1]
                    if hasattr(last_msg, 'content'):
                        last_message = str(last_msg.content)[:100]
                
                title = checkpoint.metadata.get("title")
                if not title and messages:
                    first_user_msg = next((m for m in messages if hasattr(m, 'role') and m.role == 'user'), None)
                    if first_user_msg and hasattr(first_user_msg, 'content'):
                        title = str(first_user_msg.content)[:50]
                
                sessions.append(SessionInfo(
                    thread_id=thread_id,
                    title=title or f"Session {thread_id[:8]}",
                    created_at=checkpoint.metadata.get("created_at"),
                    updated_at=checkpoint.metadata.get("created_at"),
                    last_message=last_message,
                    message_count=len(messages)
                ))
            
            sessions.sort(key=lambda x: x.updated_at or datetime.min, reverse=True)
            return sessions
        
        else:
            print("[SESSIONS] Checkpointer does not support listing threads - returning empty list")
            logger.warning("Checkpointer does not support listing threads")
            return []
    
    except Exception as e:
        print(f"[SESSIONS] ERROR: {e}")
        logger.error(f"Failed to list sessions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list sessions: {str(e)}")


@router.get("/{thread_id}", response_model=SessionInfo)
async def get_session(thread_id: str):
    """Get a specific session by thread ID."""
    try:
        checkpointer = await get_checkpointer()
        
        # Build graph with checkpointer to get state
        graph = build_graph(checkpointer=checkpointer)
        
        # Get the latest state for this thread
        config = {"configurable": {"thread_id": thread_id}}
        state = await graph.aget_state(config)
        
        if not state:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Extract messages
        messages = state.values.get("messages", [])
        last_message = None
        if messages:
            last_msg = messages[-1]
            if hasattr(last_msg, 'content'):
                last_message = str(last_msg.content)[:100]
        
        # Extract title
        title = state.metadata.get("title")
        if not title and messages:
            first_user_msg = next((m for m in messages if hasattr(m, 'role') and m.role == 'user'), None)
            if first_user_msg and hasattr(first_user_msg, 'content'):
                title = str(first_user_msg.content)[:50]
        
        return SessionInfo(
            thread_id=thread_id,
            title=title or f"Session {thread_id[:8]}",
            created_at=state.metadata.get("created_at"),
            updated_at=state.metadata.get("created_at"),
            last_message=last_message,
            message_count=len(messages)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get session {thread_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")


@router.delete("/{thread_id}")
async def delete_session(thread_id: str):
    """Delete a session (thread) from the checkpointer by deleting all checkpoints for that thread."""
    try:
        checkpointer = await get_checkpointer()
        
        # Check if this is a PostgreSQL checkpointer
        checkpointer_type = type(checkpointer).__name__
        is_postgres = 'Postgres' in checkpointer_type or 'postgres' in str(type(checkpointer))
        
        if is_postgres:
            # Delete from PostgreSQL database directly
            import asyncpg
            from urllib.parse import urlparse
            import os
            
            postgres_uri = os.getenv("POSTGRES_URI")
            if not postgres_uri:
                raise HTTPException(status_code=500, detail="POSTGRES_URI not configured")
            
            parsed = urlparse(postgres_uri)
            
            conn = await asyncpg.connect(
                host=parsed.hostname or "localhost",
                port=parsed.port or 5432,
                database=parsed.path.lstrip("/") if parsed.path else "ecocash_assistant",
                user=parsed.username or "postgres",
                password=parsed.password or ""
            )
            
            try:
                # Delete all checkpoints for this thread_id
                delete_query = """
                    DELETE FROM checkpoints
                    WHERE thread_id = $1 AND checkpoint_ns = ''
                """
                result = await conn.execute(delete_query, thread_id)
                deleted_count = int(result.split()[-1])  # Extract count from "DELETE N"
                
                logger.info(f"Deleted {deleted_count} checkpoints for thread_id: {thread_id}")
                return {
                    "message": "Session deleted successfully",
                    "thread_id": thread_id,
                    "deleted_checkpoints": deleted_count
                }
            finally:
                await conn.close()
        else:
            # For MemorySaver, we can't delete (it's in-memory)
            logger.warning(f"Delete not supported for {checkpointer_type} checkpointer")
            return {
                "message": "Delete not supported for in-memory checkpointer",
                "thread_id": thread_id
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete session {thread_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete session: {str(e)}")

