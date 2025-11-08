#!/bin/bash

# Setup Linear webhook
# Usage: ./setup-linear-webhook.sh <webhook-url>

WEBHOOK_URL=$1
LINEAR_API_KEY=${LINEAR_API_KEY}

if [ -z "$WEBHOOK_URL" ]; then
  echo "Usage: ./setup-linear-webhook.sh <webhook-url>"
  exit 1
fi

if [ -z "$LINEAR_API_KEY" ]; then
  echo "Error: LINEAR_API_KEY environment variable not set"
  exit 1
fi

echo "Setting up Linear webhook..."

curl -X POST \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$WEBHOOK_URL/webhook/linear\",
    \"resourceTypes\": [\"Issue\", \"Comment\", \"Project\"],
    \"enabled\": true
  }" \
  "https://api.linear.app/graphql"

echo "Linear webhook setup complete!"
