# Quick Start Guide

## 5-Minute Setup

### Step 1: Get API Tokens (3 minutes)

1. **GitHub Token**: https://github.com/settings/tokens → Generate new token (classic) → Select `repo` and `admin:repo_hook`

2. **Linear API Key**: https://linear.app/settings/api → Create new API key

3. **Notion Token**: https://www.notion.so/my-integrations → New integration → Copy token → Share Action Log database with integration

### Step 2: Deploy to Railway (2 minutes)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Clone repo
git clone https://github.com/Trancendos/platform-sync-buffer.git
cd platform-sync-buffer

# Initialize Railway project
railway init

# Set variables
railway variables set GITHUB_TOKEN="your_github_token"
railway variables set LINEAR_API_KEY="your_linear_key"
railway variables set NOTION_TOKEN="your_notion_token"
railway variables set NOTION_BUFFER_DB_ID="582ea8f4-b7ca-4e5e-ba7f-7287b1a72108"
railway variables set WEBHOOK_SECRET="$(openssl rand -hex 32)"

# Deploy
railway up

# Get your URL
DEPLOY_URL=$(railway domain)
echo "Deployed to: https://$DEPLOY_URL"
```

### Step 3: Register Webhooks (30 seconds)

```bash
# Set deployment URL
export SERVER_BASE_URL=https://your-app.railway.app

# Install dependencies locally
npm install

# Register webhooks
node scripts/register-webhooks.js
```

### Step 4: Test (30 seconds)

```bash
# Validate setup
node scripts/validate-setup.js

# Test endpoints
curl https://your-app.railway.app/health

# Check stats
curl https://your-app.railway.app/api/status
```

### Step 5: Verify Sync

1. Create a test issue in Linear mentioning GitHub repo
2. Check your Notion Action Log: https://www.notion.so/a91ed815daef4a39824af879aab685bb
3. Verify entry appears with correct platform IDs

---

## What's Next?

- Monitor your [Notion Dashboard](https://www.notion.so/2a56dc80116981bf9b3dd998201b93d7)
- Review [Linear issue TRA-49](https://linear.app/trancendos/issue/TRA-49)
- Check [GitHub repository](https://github.com/Trancendos/platform-sync-buffer)
- Set up alerts for conflicts
- Customize sync rules as needed

---

## Troubleshooting

**Issue: Webhooks not working**
- Check webhook deliveries in GitHub/Linear settings
- Verify SERVER_BASE_URL is public and correct
- Check firewall rules

**Issue: API authentication failed**
- Verify tokens are correct and not expired
- Check token permissions/scopes
- Ensure Notion integration has database access

**Issue: No actions appearing in Notion**
- Verify NOTION_BUFFER_DB_ID is correct
- Check Notion integration permissions
- Review application logs

---

## Daily Operations

**Morning Check (2 minutes):**
1. Open Notion Action Log
2. Filter by "Conflict" or "Failed" status
3. Review any errors
4. Resolve conflicts if any

**Weekly Review (10 minutes):**
1. Check buffer statistics
2. Review sync success rates
3. Update conflict resolution rules if needed
4. Check for platform API changes

**Monthly Maintenance (30 minutes):**
1. Review all error logs
2. Update dependencies
3. Rotate webhook secrets
4. Optimize sync rules based on patterns
5. Update documentation

---

That's it! You're now running a fully automated cross-platform sync system.
