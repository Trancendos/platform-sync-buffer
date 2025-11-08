#!/bin/bash

# Setup webhooks for GitHub repositories
# Usage: ./setup-webhooks.sh <webhook-url>

WEBHOOK_URL=$1
GITHUB_TOKEN=${GITHUB_TOKEN}
GITHUB_OWNER="Trancendos"

if [ -z "$WEBHOOK_URL" ]; then
  echo "Usage: ./setup-webhooks.sh <webhook-url>"
  exit 1
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable not set"
  exit 1
fi

echo "Setting up webhooks for GitHub repositories..."

# Get list of all repositories
REPOS=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/users/$GITHUB_OWNER/repos?per_page=100" | \
  jq -r '.[].name')

for REPO in $REPOS; do
  echo "Setting up webhook for $REPO..."
  
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"config\": {
        \"url\": \"$WEBHOOK_URL/webhook/github\",
        \"content_type\": \"json\",
        \"secret\": \"$WEBHOOK_SECRET\"
      },
      \"events\": [\"push\", \"issues\", \"pull_request\", \"issue_comment\"],
      \"active\": true
    }" \
    "https://api.github.com/repos/$GITHUB_OWNER/$REPO/hooks"
  
  echo "Webhook configured for $REPO"
done

echo "GitHub webhook setup complete!"
