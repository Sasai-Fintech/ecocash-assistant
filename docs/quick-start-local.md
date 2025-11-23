# Quick Start: Local PostgreSQL Setup

## ✅ Database Created Successfully!

The database `ecocash_assistant` has been created. Now you just need to configure the backend.

## Step 1: Configure Backend Connection

Create or update `backend/.env` file:

```bash
# Use your macOS username (vishnu.kumar) as the database user
POSTGRES_URI=postgresql://vishnu.kumar@localhost:5432/ecocash_assistant

# Your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Since PostgreSQL was installed via Homebrew, it uses your macOS username as the default superuser. No password is needed for local connections.

## Step 2: Verify Connection

Test the connection:

```bash
# Add PostgreSQL to PATH (add to ~/.zshrc for permanent)
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

# Test connection
psql -d ecocash_assistant -c "SELECT version();"
```

## Step 3: Restart Backend

If your backend is already running, restart it to pick up the new PostgreSQL connection:

1. Stop the backend (Ctrl+C in the terminal)
2. Start it again: `cd backend && poetry run uvicorn app.main:app --reload --port 8000`

The backend will automatically:
- Connect to PostgreSQL if `POSTGRES_URI` is set
- Fall back to MemorySaver if PostgreSQL is unavailable
- Log connection status on startup

## Step 4: Test Session Persistence

1. Start a conversation in the frontend
2. Send a few messages
3. Restart the backend server
4. Continue the conversation - it should remember previous messages!

## Verify It's Working

Check backend logs for:
```
✅ "Using PostgreSQL checkpointer" (if connected)
⚠️  "Using MemorySaver" (if PostgreSQL unavailable)
```

Check database has checkpoints:
```bash
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
psql -d ecocash_assistant -c "SELECT COUNT(*) FROM checkpoints;"
```

## Troubleshooting

### Backend can't connect
- Verify PostgreSQL is running: `brew services list`
- Check connection string in `backend/.env`
- Check backend logs for error messages

### psql command not found
Add to your `~/.zshrc`:
```bash
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
```
Then: `source ~/.zshrc`

### pgvector extension (optional)
pgvector is only needed for future vector storage. The checkpointer works fine without it. If you need it later, you can:
1. Upgrade to PostgreSQL 17/18, or
2. Install pgvector from source for PostgreSQL 15

## Next Steps

Once local testing is complete, you can:
1. Test with Docker: `docker-compose up -d postgres`
2. Deploy to Azure: Follow `azure-deploy.md`

