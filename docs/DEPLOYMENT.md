# Deployment Guide

## Quick Start (5 Minutes)

### 1. Prerequisites

- Node.js 18+ installed
- Git installed
- API tokens ready (see below)

### 2. Clone and Setup

```bash
git clone https://github.com/Trancendos/platform-sync-buffer.git
cd platform-sync-buffer
npm install
cp .env.example .env
```

### 3. Configure Environment

Edit `.env` and add your tokens:

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxx
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_BUFFER_DB_ID=582ea8f4-b7ca-4e5e-ba7f-7287b1a72108
WEBHOOK_SECRET=$(openssl rand -hex 32)
SERVER_BASE_URL=http://localhost:3000
```

### 4. Build and Run

```bash
npm run build
npm start
```

Server will start on port 3000.

### 5. Test Connection

```bash
curl http://localhost:3000/health
# Should return: {"status":"healthy","timestamp":"..."}
```

---

## Production Deployment Options

### Option A: Railway (Recommended)

**Why Railway?**
- Free tier: 500 hours/month
- Automatic HTTPS
- Easy environment variables
- GitHub integration
- Zero-config deployment

**Steps:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to GitHub repo
railway link

# Add environment variables
railway variables set GITHUB_TOKEN="your_token"
railway variables set LINEAR_API_KEY="your_key"
railway variables set NOTION_TOKEN="your_token"
railway variables set NOTION_BUFFER_DB_ID="582ea8f4-b7ca-4e5e-ba7f-7287b1a72108"
railway variables set WEBHOOK_SECRET="$(openssl rand -hex 32)"

# Deploy
railway up

# Get your deployment URL
railway domain
```

### Option B: Render

1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository: `Trancendos/platform-sync-buffer`
4. Set environment variables in Render dashboard
5. Deploy

**Configuration:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Plan: Free tier available

### Option C: Google Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/platform-sync-buffer

# Deploy
gcloud run deploy platform-sync-buffer \
  --image gcr.io/YOUR_PROJECT_ID/platform-sync-buffer \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GITHUB_TOKEN="$GITHUB_TOKEN" \
  --set-env-vars LINEAR_API_KEY="$LINEAR_API_KEY" \
  --set-env-vars NOTION_TOKEN="$NOTION_TOKEN" \
  --set-env-vars NOTION_BUFFER_DB_ID="582ea8f4-b7ca-4e5e-ba7f-7287b1a72108" \
  --set-env-vars WEBHOOK_SECRET="$WEBHOOK_SECRET"
```

### Option D: Self-Hosted Docker

```bash
# Build image
docker build -t platform-sync-buffer .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

## Getting API Tokens

### GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (Full control of repository hooks)
4. Generate and copy token
5. Store securely

### Linear API Key

1. Go to https://linear.app/settings/api
2. Click "Create new API key"
3. Give it a descriptive name: "Platform Sync Buffer"
4. Copy the key
5. Store securely

### Notion Integration Token

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Name: "Platform Sync Buffer"
4. Associated workspace: Select your workspace
5. Submit
6. Copy the "Internal Integration Token"
7. **Important**: Share your Action Log database with this integration:
   - Open the database in Notion
   - Click "..." menu
   - Click "Add connections"
   - Select your integration

---

## Post-Deployment Configuration

### 1. Register Webhooks

Once deployed and you have your public URL:

```bash
# Set your deployment URL
export SERVER_BASE_URL=https://your-app.railway.app

# Register webhooks
node scripts/register-webhooks.js
```

### 2. Verify Setup

```bash
# Run validation script
node scripts/validate-setup.js
```

Should show:
```
✓ GitHub authenticated as: Trancendos
✓ Linear authenticated as: Andrew Porter
✓ Notion database accessible: Integration Action Log
✓ All systems validated successfully!
```

### 3. Test Webhook Endpoints

```bash
# Run endpoint tests
./scripts/test-webhooks.sh
```

---

## Monitoring

### Health Check

```bash
curl https://your-app.railway.app/health
```

### Buffer Statistics

```bash
curl https://your-app.railway.app/api/status
```

Returns:
```json
{
  "total": 10,
  "pending": 2,
  "synced": 7,
  "failed": 0,
  "conflicts": 1,
  "validated": 8
}
```

### Manual Validation Trigger

```bash
curl -X POST https://your-app.railway.app/api/validate
```

### Manual Sync Trigger

```bash
curl -X POST https://your-app.railway.app/api/sync \
  -H "Content-Type: application/json" \
  -d '{"entityId": "TRA-49", "entityType": "Issue"}'
```

---

## Troubleshooting

### Webhooks Not Receiving Events

**Check:**
1. Server is publicly accessible (not localhost)
2. Webhook URL is correct in platform settings
3. Webhook secret matches environment variable
4. Firewall allows incoming connections

**Debug:**
```bash
# Check webhook deliveries in GitHub
# Go to repo → Settings → Webhooks → Recent Deliveries

# Check Linear webhook logs
# Go to Linear Settings → API → Webhooks
```

### Notion API Rate Limits

**Symptoms:** 429 errors in logs

**Solution:** Built-in retry logic handles this automatically. If persistent:
- Reduce polling frequency
- Batch Notion API calls
- Add exponential backoff

### Validation Failures

**Check:**
1. API tokens are valid
2. Permissions are correct
3. Entity IDs exist on all platforms

**Debug:**
```bash
# Check logs
tail -f logs/app.log

# Or with Docker
docker-compose logs -f sync-buffer
```

### Sync Conflicts

**Resolution:**
1. Check Notion Action Log for conflict entries
2. Review error messages
3. Manual resolution may be required
4. Adjust conflict resolution rules in code

---

## Scaling

### For High Volume

- Use Redis for caching and queue management
- Separate validation worker from webhook server
- Implement rate limiting
- Add database for local state (PostgreSQL)

### For Multiple Teams

- Add team/organization filtering
- Separate buffer databases per team
- Team-specific webhook endpoints

---

## Security Best Practices

1. **Rotate webhook secrets** every 90 days
2. **Use environment variables** for all secrets
3. **Enable HTTPS only** in production
4. **Implement rate limiting** on webhook endpoints
5. **Log all access** for audit trails
6. **Regular security scans** (GitHub Actions included)

---

## Cost Estimates

| Platform | Free Tier | Paid Tier |
|----------|-----------|------------|
| Railway | 500 hrs/mo | $5-10/mo |
| Render | 750 hrs/mo | $7/mo |
| Cloud Run | $0-5/mo | $5-15/mo |
| Heroku | - | $7/mo |
| VPS (DigitalOcean) | - | $6/mo |

**API Costs:** All within free tiers for typical usage

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/Trancendos/platform-sync-buffer/issues
- Email: victicnor@gmail.com
