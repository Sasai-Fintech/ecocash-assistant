#!/bin/bash

# Setup script for local PostgreSQL with pgvector
# For macOS using Homebrew

echo "🚀 Setting up local PostgreSQL for EcoCash Assistant..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL via Homebrew..."
    brew install postgresql@15
    brew services start postgresql@15
    echo "✅ PostgreSQL installed and started"
else
    echo "✅ PostgreSQL is already installed"
    # Ensure it's running
    brew services start postgresql@15 2>/dev/null || echo "PostgreSQL is running"
fi

# Wait a moment for PostgreSQL to be ready
sleep 2

# Check if pgvector extension is available
echo "📦 Checking for pgvector extension..."

# Try to connect and check for pgvector
psql -U postgres -d postgres -c "SELECT 1" 2>/dev/null || {
    echo "⚠️  Could not connect to PostgreSQL. Creating user if needed..."
    # Create postgres user if it doesn't exist (for some installations)
    createuser -s postgres 2>/dev/null || echo "User postgres may already exist"
}

# Create database
echo "📝 Creating database 'ecocash_assistant'..."
psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname='ecocash_assistant'" | grep -q 1 || \
    psql -U postgres -d postgres -c "CREATE DATABASE ecocash_assistant"

# Install pgvector extension
echo "📦 Installing pgvector extension..."
# First, try to install via Homebrew
if ! brew list pgvector &> /dev/null; then
    echo "Installing pgvector via Homebrew..."
    brew install pgvector
fi

# Connect to database and install extension
psql -U postgres -d ecocash_assistant <<EOF
CREATE EXTENSION IF NOT EXISTS vector;
\dx
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Connection details:"
echo "   Database: ecocash_assistant"
echo "   User: postgres"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔗 Connection string:"
echo "   postgresql://postgres@localhost:5432/ecocash_assistant"
echo ""
echo "💡 Add this to your backend/.env file:"
echo "   POSTGRES_URI=postgresql://postgres@localhost:5432/ecocash_assistant"
echo ""

