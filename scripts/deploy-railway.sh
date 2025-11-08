#!/bin/bash

# Deploy to Railway
# Usage: ./deploy-railway.sh

echo "Deploying to Railway..."

if ! command -v railway &> /dev/null; then
  echo "Railway CLI not found. Installing..."
  npm install -g @railway/cli
fi

# Login to Railway
railway login

# Initialize project if not already
if [ ! -f "railway.json" ]; then
  echo "Initializing Railway project..."
  railway init
fi

# Set environment variables
echo "Setting environment variables..."
railway variables set GITHUB_TOKEN="$GITHUB_TOKEN"
railway variables set LINEAR_API_KEY="$LINEAR_API_KEY"
railway variables set NOTION_INTEGRATION_TOKEN="$NOTION_INTEGRATION_TOKEN"
railway variables set NOTION_ACTION_LOG_DATABASE_ID="$NOTION_ACTION_LOG_DATABASE_ID"
railway variables set WEBHOOK_SECRET="$WEBHOOK_SECRET"
railway variables set PORT="3000"

# Deploy
echo "Deploying application..."
railway up

# Get deployment URL
DEPLOY_URL=$(railway domain)

echo ""
echo "✅ Deployment complete!"
echo "URL: https://$DEPLOY_URL"
echo ""
echo "Next: Update SERVER_BASE_URL and register webhooks"
