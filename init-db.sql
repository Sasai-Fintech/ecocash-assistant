-- Create database (if not exists)
-- Database is created by POSTGRES_DB env var, but we ensure pgvector is installed
CREATE EXTENSION IF NOT EXISTS vector;

