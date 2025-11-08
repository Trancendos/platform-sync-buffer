#!/bin/bash

# Test webhook endpoints are responding
# Usage: ./test-webhooks.sh

SERVER_URL=${SERVER_BASE_URL:-"http://localhost:3000"}

echo "Testing webhook endpoints at $SERVER_URL"
echo ""

# Test health endpoint
echo "Testing health endpoint..."
HEALTH=$(curl -s -w "\n%{http_code}" "$SERVER_URL/health")
HTTP_CODE=$(echo "$HEALTH" | tail -n1)
RESPONSE=$(echo "$HEALTH" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Health check passed"
  echo "  Response: $RESPONSE"
else
  echo "✗ Health check failed (HTTP $HTTP_CODE)"
  exit 1
fi

echo ""

# Test GitHub webhook endpoint (without valid signature)
echo "Testing GitHub webhook endpoint..."
GITHUB_TEST=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "test"}' \
  "$SERVER_URL/webhook/github")

HTTP_CODE=$(echo "$GITHUB_TEST" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✓ GitHub webhook endpoint responding"
else
  echo "✗ GitHub webhook endpoint failed (HTTP $HTTP_CODE)"
fi

echo ""

# Test Linear webhook endpoint
echo "Testing Linear webhook endpoint..."
LINEAR_TEST=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}' \
  "$SERVER_URL/webhook/linear")

HTTP_CODE=$(echo "$LINEAR_TEST" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✓ Linear webhook endpoint responding"
else
  echo "✗ Linear webhook endpoint failed (HTTP $HTTP_CODE)"
fi

echo ""
echo "Webhook endpoint tests complete!"
