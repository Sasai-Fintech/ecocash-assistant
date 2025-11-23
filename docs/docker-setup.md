# Docker Setup Guide

This guide explains how to run the EcoCash Assistant using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or later

## Quick Start

1. **Create environment file**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## Services

### PostgreSQL (port 5432)
- Database: `ecocash_assistant`
- User: `postgres`
- Password: Set via `POSTGRES_PASSWORD` in `.env`
- Includes `pgvector` extension for vector storage

### Backend (port 8000)
- FastAPI application
- Connects to PostgreSQL for session persistence
- Health check: `http://localhost:8000/`

### Frontend (port 3000)
- Next.js application
- Connects to backend API
- Health check: `http://localhost:3000/api/health`

## Environment Variables

Create a `.env` file in the root directory:

```bash
# PostgreSQL
POSTGRES_PASSWORD=your_secure_password

# Backend
OPENAI_API_KEY=your_openai_api_key

# Frontend (optional, defaults work for local dev)
NEXT_PUBLIC_REMOTE_ACTION_URL=http://localhost:8000/api/copilotkit
```

## Development Workflow

### Rebuild after code changes:
```bash
docker-compose up -d --build
```

### View specific service logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Access PostgreSQL:
```bash
docker-compose exec postgres psql -U postgres -d ecocash_assistant
```

### Restart a specific service:
```bash
docker-compose restart backend
```

## Database Management

### Initialize database (pgvector extension):
The `init-db.sql` script runs automatically on first startup to install the pgvector extension.

### Backup database:
```bash
docker-compose exec postgres pg_dump -U postgres ecocash_assistant > backup.sql
```

### Restore database:
```bash
docker-compose exec -T postgres psql -U postgres ecocash_assistant < backup.sql
```

## Troubleshooting

### Services won't start:
1. Check if ports 3000, 8000, 5432 are available
2. Verify Docker has enough resources allocated
3. Check logs: `docker-compose logs`

### Database connection errors:
1. Ensure PostgreSQL is healthy: `docker-compose ps`
2. Check connection string in backend logs
3. Verify `POSTGRES_PASSWORD` is set correctly

### Frontend can't connect to backend:
1. Check `NEXT_PUBLIC_REMOTE_ACTION_URL` environment variable
2. Verify backend is running: `curl http://localhost:8000/`
3. Check network: `docker-compose network ls`

### Health checks failing:
1. Wait for services to fully start (40s start period)
2. Check service logs for errors
3. Verify endpoints are accessible

## Production Considerations

For production deployment:
1. Use strong passwords for PostgreSQL
2. Set up proper networking (don't expose PostgreSQL port)
3. Use environment-specific `.env` files
4. Configure resource limits in `docker-compose.yml`
5. Set up volume backups for PostgreSQL data
6. Use Azure Container Apps or similar for orchestration

## Clean Up

### Remove all containers and volumes:
```bash
docker-compose down -v
```

### Remove images:
```bash
docker-compose down --rmi all
```

