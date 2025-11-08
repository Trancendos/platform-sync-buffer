#!/bin/bash

# Deployment script
# Usage: ./deploy.sh <environment>

ENV=$1

if [ -z "$ENV" ]; then
  echo "Usage: ./deploy.sh <environment>"
  echo "Environments: production, staging, development"
  exit 1
fi

echo "Deploying to $ENV environment..."

# Build
echo "Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

# Run tests
echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi

# Deploy based on environment
case $ENV in
  production)
    echo "Deploying to production..."
    # Add your production deployment commands
    # Example: railway up --environment production
    ;;
  staging)
    echo "Deploying to staging..."
    # Add your staging deployment commands
    ;;
  development)
    echo "Deploying to development..."
    # Add your development deployment commands
    ;;
  *)
    echo "Unknown environment: $ENV"
    exit 1
    ;;
esac

echo "Deployment to $ENV complete!"
