# Platform Sync Buffer System

## Overview

Central integration hub for maintaining synchronization between GitHub, Linear, and Notion platforms. Uses Notion as the buffer/source of truth with automated validation and conflict resolution.

## Architecture

### Components

1. **Webhook Listeners** - Receive events from GitHub and Linear
2. **Notion Poller** - Regular polling of Notion changes (no native webhooks)
3. **Validation Service** - Cross-platform consistency checks every 6 hours
4. **Sync Workers** - Automated reconciliation and conflict resolution
5. **Action Log** - Notion database tracking all platform actions

### Data Flow

```
GitHub Event → Webhook → Buffer Registration → Validation → Sync to Linear/Notion
Linear Event → Webhook → Buffer Registration → Validation → Sync to GitHub/Notion
Notion Change → Poller → Buffer Registration → Validation → Sync to GitHub/Linear
```

## Setup

### Prerequisites

- Node.js 18+
- GitHub Personal Access Token with repo permissions
- Linear API Key
- Notion Integration Token

### Environment Variables

```bash
cp .env.example .env
```

Required variables:
```
GITHUB_TOKEN=your_github_token
LINEAR_API_KEY=your_linear_key
NOTION_TOKEN=your_notion_token
NOTION_BUFFER_DB_ID=582ea8f4-b7ca-4e5e-ba7f-7287b1a72108
WEBHOOK_SECRET=your_webhook_secret
PORT=3000
```

### Installation

```bash
npm install
npm run build
npm start
```

### Docker Deployment

```bash
docker build -t platform-sync-buffer .
docker run -p 3000:3000 --env-file .env platform-sync-buffer
```

## API Endpoints

### Webhooks

- `POST /webhook/github` - GitHub webhook receiver
- `POST /webhook/linear` - Linear webhook receiver
- `GET /health` - Health check endpoint

### Manual Operations

- `POST /api/validate` - Trigger immediate validation
- `POST /api/sync` - Force sync specific entity
- `GET /api/status` - Get buffer status

## Configuration

### GitHub Webhook Setup

1. Go to your repository → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/webhook/github`
3. Secret: Use value from `WEBHOOK_SECRET`
4. Events: Select `Issues`, `Pull requests`, `Push`, `Commits`

### Linear Webhook Setup

1. Go to Linear Settings → API → Webhooks
2. Add webhook URL: `https://your-domain.com/webhook/linear`
3. Events: Select all issue and project events

## Validation Rules

### GitHub → Linear → Notion
- Commits reference issue IDs → Update Linear issue status → Update Notion tracking
- PR merged → Linear issue moved to Done → Notion page marked complete

### Linear → GitHub → Notion
- Issue status changed → GitHub label updated → Notion property synced
- Issue created → GitHub issue created (if configured) → Notion entry added

### Notion → GitHub → Linear
- Documentation updated → README synced to GitHub → Linear description updated
- Property changed → Propagate to GitHub labels and Linear fields

## Monitoring

### Metrics

- Total actions logged
- Sync success rate
- Conflict detection rate
- Average validation time
- Platform-specific error rates

### Logs

All operations logged to stdout and stored in Notion Action Log database.

## Conflict Resolution

### Priority Order (when conflicts detected)

1. **GitHub** - Source code changes (commits, PRs)
2. **Linear** - Issue tracking state (status, assignments)
3. **Notion** - Documentation and planning

### Conflict Types

- **Update Collision**: Same entity updated on multiple platforms
- **Delete-Update**: Entity deleted on one platform, updated on another
- **State Mismatch**: Inconsistent state across platforms

## Development

### Run Tests

```bash
npm test
```

### Run in Development Mode

```bash
npm run dev
```

## Deployment

### Recommended Platforms

- **Railway** - Simple deployment with auto-scaling
- **Render** - Free tier available
- **AWS Lambda** - Serverless option
- **Google Cloud Run** - Container-based serverless

## License

MIT

## Support

For issues and questions, contact: victicnor@gmail.com
