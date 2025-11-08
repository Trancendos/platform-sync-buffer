# API Reference

## Endpoints

### Health Check

**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T22:30:00.000Z"
}
```

---

### GitHub Webhook

**POST** `/webhook/github`

Receives GitHub webhook events.

**Headers:**
- `X-GitHub-Event`: Event type (push, issues, pull_request)
- `X-Hub-Signature-256`: HMAC signature for verification

**Supported Events:**
- `push` - Code commits
- `issues` - Issue created/updated/closed
- `pull_request` - PR opened/closed/merged
- `issue_comment` - Comments on issues/PRs
- `pull_request_review` - PR reviews

**Response:**
```json
{
  "received": true,
  "logged": true
}
```

---

### Linear Webhook

**POST** `/webhook/linear`

Receives Linear webhook events.

**Payload Format:**
```json
{
  "action": "create|update|remove",
  "type": "Issue|Comment|Project",
  "data": {
    "id": "uuid",
    "identifier": "TRA-49",
    "title": "Issue title",
    ...
  }
}
```

**Response:**
```json
{
  "received": true,
  "logged": true
}
```

---

### Manual Validation

**POST** `/api/validate`

Triggers immediate validation of all pending actions.

**Response:**
```json
{
  "success": true,
  "message": "Validation completed",
  "stats": {
    "checked": 15,
    "validated": 12,
    "conflicts": 2,
    "failed": 1
  }
}
```

---

### Manual Sync

**POST** `/api/sync`

Forces synchronization of a specific entity.

**Request Body:**
```json
{
  "entityId": "TRA-49",
  "entityType": "Issue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sync completed",
  "synced": {
    "github": true,
    "linear": true,
    "notion": true
  }
}
```

---

### Buffer Status

**GET** `/api/status`

Returns current buffer statistics.

**Response:**
```json
{
  "total": 150,
  "pending": 5,
  "synced": 140,
  "failed": 2,
  "conflicts": 3,
  "validated": 145,
  "lastValidation": "2025-11-08T22:00:00.000Z",
  "platformBreakdown": {
    "github": 80,
    "linear": 45,
    "notion": 25
  }
}
```

---

## Webhook Payload Examples

### GitHub Push Event

```json
{
  "ref": "refs/heads/main",
  "after": "abc123def456",
  "commits": [
    {
      "id": "abc123def456",
      "message": "feat: implement TRA-49 sync logic",
      "author": {
        "name": "Andrew Porter",
        "email": "victicnor@gmail.com"
      },
      "url": "https://github.com/Trancendos/repo/commit/abc123"
    }
  ],
  "repository": {
    "name": "platform-sync-buffer",
    "full_name": "Trancendos/platform-sync-buffer"
  }
}
```

### GitHub Issue Event

```json
{
  "action": "opened",
  "issue": {
    "number": 123,
    "title": "Bug: Sync failure",
    "body": "Related to TRA-49",
    "state": "open",
    "labels": [],
    "html_url": "https://github.com/Trancendos/repo/issues/123"
  },
  "repository": {
    "name": "platform-sync-buffer",
    "full_name": "Trancendos/platform-sync-buffer"
  }
}
```

### Linear Issue Event

```json
{
  "action": "update",
  "type": "Issue",
  "data": {
    "id": "c95772db-cbeb-4b72-b7f6-10ede56f90eb",
    "identifier": "TRA-49",
    "title": "Cross-Platform Sync",
    "state": {
      "id": "state-uuid",
      "name": "In Progress",
      "type": "started"
    },
    "url": "https://linear.app/trancendos/issue/TRA-49"
  }
}
```

---

## Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| 401 | Unauthorized | Check API tokens |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify entity IDs |
| 422 | Validation Error | Check payload format |
| 429 | Rate Limited | Reduce request frequency |
| 500 | Server Error | Check logs |

---

## Monitoring Endpoints

### Metrics (Optional)

If you add Prometheus metrics:

**GET** `/metrics`

Returns:
```
# HELP platform_sync_actions_total Total actions logged
# TYPE platform_sync_actions_total counter
platform_sync_actions_total{platform="github"} 80
platform_sync_actions_total{platform="linear"} 45
platform_sync_actions_total{platform="notion"} 25

# HELP platform_sync_validation_duration_seconds Validation duration
# TYPE platform_sync_validation_duration_seconds histogram
platform_sync_validation_duration_seconds_sum 45.2
platform_sync_validation_duration_seconds_count 10
```

---

## Rate Limits

### Platform Limits

- **GitHub**: 5,000 requests/hour (authenticated)
- **Linear**: 2,000 requests/hour
- **Notion**: 3 requests/second

### Buffer System Limits

- Webhook processing: No limit
- Validation runs: Every 6 hours (configurable)
- Notion polling: Every 5 minutes (configurable)

---

## Custom Configuration

### Adjust Validation Schedule

Edit `.env`:
```env
# Run every 3 hours instead of 6
VALIDATION_SCHEDULE='0 */3 * * *'
```

### Change Notion Polling Interval

Edit `src/index.ts`:
```typescript
// Poll every 10 minutes instead of 5
cron.schedule('*/10 * * * *', async () => {
  await notionPoller.poll();
});
```

### Enable/Disable Auto-Sync

Edit `.env`:
```env
SYNC_ENABLED=true  # Set to false to only log, not sync
```

---

## Advanced Features

### Webhook Retry Logic

Webhooks are retried automatically by GitHub and Linear if delivery fails.

### Manual Retry

If you need to manually retry a failed action:

```bash
curl -X POST https://your-app.com/api/sync \
  -H "Content-Type: application/json" \
  -d '{
    "entityId": "TRA-49",
    "entityType": "Issue",
    "platforms": ["github", "linear", "notion"]
  }'
```

### Bulk Validation

Validate all actions in a date range:

```bash
curl -X POST https://your-app.com/api/validate/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-11-01",
    "endDate": "2025-11-08"
  }'
```
