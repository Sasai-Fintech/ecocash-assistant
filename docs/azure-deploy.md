# Azure Container Apps Deployment Guide

This guide explains how to deploy the EcoCash Assistant to Azure Container Apps.

## Prerequisites

- Azure CLI installed and configured
- Azure Container Registry (ACR) created
- Azure Container Apps environment created
- Azure Database for PostgreSQL Flexible Server (or use Container Instance)

## Step 1: Build and Push Images to Azure Container Registry

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="ecocash-rg"
ACR_NAME="ecocashregistry"
LOCATION="eastus"

# Build and push backend image
az acr build --registry $ACR_NAME --image ecocash-backend:latest ./backend

# Build and push frontend image
az acr build --registry $ACR_NAME --image ecocash-frontend:latest ./frontend
```

## Step 2: Deploy PostgreSQL Database

### Option A: Azure Database for PostgreSQL Flexible Server (Recommended)

```bash
# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name ecocash-postgres \
  --location $LOCATION \
  --admin-user postgres \
  --admin-password <your-secure-password> \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32 \
  --public-access 0.0.0.0

# Connect and install pgvector extension
# Use Azure Cloud Shell or local psql:
psql -h ecocash-postgres.postgres.database.azure.com -U postgres -d postgres
CREATE EXTENSION IF NOT EXISTS vector;
```

### Option B: Azure Container Instance (Development)

```bash
az container create \
  --resource-group $RESOURCE_GROUP \
  --name ecocash-postgres \
  --image pgvector/pgvector:pg15 \
  --dns-name-label ecocash-postgres \
  --ports 5432 \
  --environment-variables \
    POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=<your-password> \
    POSTGRES_DB=ecocash_assistant
```

## Step 3: Create Container Apps Environment

```bash
# Create Container Apps environment
az containerapp env create \
  --name ecocash-env \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

## Step 4: Deploy Backend Container App

```bash
# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

# Create backend container app
az containerapp create \
  --name ecocash-backend \
  --resource-group $RESOURCE_GROUP \
  --environment ecocash-env \
  --image $ACR_LOGIN_SERVER/ecocash-backend:latest \
  --target-port 8000 \
  --ingress external \
  --env-vars \
    POSTGRES_URI="postgresql://postgres:<password>@ecocash-postgres.postgres.database.azure.com:5432/ecocash_assistant" \
    OPENAI_API_KEY="@Microsoft.KeyVault(SecretUri=<your-key-vault-secret-uri>)" \
  --registry-server $ACR_LOGIN_SERVER \
  --cpu 1.0 \
  --memory 2.0Gi \
  --min-replicas 1 \
  --max-replicas 3
```

## Step 5: Deploy Frontend Container App

```bash
# Get backend URL
BACKEND_URL=$(az containerapp show --name ecocash-backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn -o tsv)

# Create frontend container app
az containerapp create \
  --name ecocash-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment ecocash-env \
  --image $ACR_LOGIN_SERVER/ecocash-frontend:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars \
    NEXT_PUBLIC_REMOTE_ACTION_URL="https://$BACKEND_URL/api/copilotkit" \
  --registry-server $ACR_LOGIN_SERVER \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 2
```

## Step 6: Configure Health Probes

Health probes are automatically configured via Dockerfile HEALTHCHECK, but you can also configure them in Azure:

```bash
# Backend health probe
az containerapp update \
  --name ecocash-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars HEALTH_CHECK_PATH=/

# Frontend health probe
az containerapp update \
  --name ecocash-frontend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars HEALTH_CHECK_PATH=/api/health
```

## Step 7: Configure Networking

Ensure backend and frontend can communicate:

```bash
# Allow backend to access PostgreSQL (if using Flexible Server)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name ecocash-postgres \
  --rule-name allow-container-apps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Environment Variables

### Backend
- `POSTGRES_URI`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key (store in Key Vault)
- `REMOTE_ACTION_URL`: Backend URL (optional, for internal routing)

### Frontend
- `NEXT_PUBLIC_REMOTE_ACTION_URL`: Backend API URL
- `OPENAI_API_KEY`: (if needed for client-side operations)

## Scaling Configuration

### Backend
- Min replicas: 1
- Max replicas: 3
- CPU: 1.0
- Memory: 2.0Gi

### Frontend
- Min replicas: 1
- Max replicas: 2
- CPU: 0.5
- Memory: 1.0Gi

## Monitoring

View logs:
```bash
az containerapp logs show --name ecocash-backend --resource-group $RESOURCE_GROUP --follow
az containerapp logs show --name ecocash-frontend --resource-group $RESOURCE_GROUP --follow
```

## Troubleshooting

1. **Container won't start**: Check logs and ensure environment variables are set correctly
2. **Database connection fails**: Verify PostgreSQL firewall rules and connection string
3. **Health checks failing**: Ensure health endpoints are accessible
4. **Images not found**: Verify ACR images are built and accessible

## Cost Optimization

- Use Azure Database for PostgreSQL Flexible Server Burstable tier for development
- Set min-replicas to 0 for non-production environments
- Use Azure Container Apps consumption plan for pay-per-use pricing

