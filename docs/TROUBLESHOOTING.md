# Troubleshooting Guide

## Common Issues

### 1. Webhooks Not Receiving Events

**Symptoms:**
- No entries appearing in Notion Action Log
- GitHub/Linear webhook shows failed deliveries

**Diagnosis:**
```bash
# Check if server is running
curl https://your-app.com/health

# Test webhook endpoints
./scripts/test-webhooks.sh

# Check webhook deliveries in GitHub
# Repo → Settings → Webhooks → Recent Deliveries
```

**Solutions:**

1. **Server not publicly accessible:**
   - Ensure deployment URL is public (not localhost)
   - Check firewall rules
   - Verify SSL certificate is valid

2. **Wrong webhook URL:**
   - Update SERVER_BASE_URL in environment
   - Re-register webhooks: `node scripts/register-webhooks.js`

3. **Invalid signature:**
   - Ensure WEBHOOK_SECRET matches in platform settings
   - Check signature verification logic

---

### 2. Authentication Failures

**Symptoms:**
- 401 Unauthorized errors in logs
- "Invalid credentials" messages

**Diagnosis:**
```bash
node scripts/validate-setup.js
```

**Solutions:**

1. **GitHub token issues:**
   - Regenerate token: https://github.com/settings/tokens
   - Ensure scopes: `repo`, `admin:repo_hook`
   - Update GITHUB_TOKEN in environment

2. **Linear API key issues:**
   - Generate new key: https://linear.app/settings/api
   - Update LINEAR_API_KEY in environment
   - Ensure key has full access

3. **Notion token issues:**
   - Check integration: https://www.notion.so/my-integrations
   - Verify database is shared with integration
   - Regenerate token if necessary

---

### 3. Notion API Rate Limiting

**Symptoms:**
- 429 Too Many Requests errors
- Delays in Notion updates

**Diagnosis:**
```bash
grep "429" logs/app.log
```

**Solutions:**

1. **Reduce polling frequency:**
   ```typescript
   // In src/index.ts, change from 5 to 10 minutes
   cron.schedule('*/10 * * * *', async () => {
     await notionPoller.poll();
   });
   ```

2. **Batch API calls:**
   - Group multiple updates
   - Use bulk operations where possible

3. **Add retry logic with exponential backoff:**
   - Built-in retry handles temporary rate limits
   - Persistent limits require frequency reduction

---

### 4. Sync Conflicts

**Symptoms:**
- Actions marked as "Conflict" in Action Log
- Inconsistent data across platforms

**Diagnosis:**
1. Open Notion Action Log
2. Filter by Sync Status = "Conflict"
3. Review Error Log field

**Solutions:**

1. **Simultaneous updates:**
   - Review conflict resolution rules
   - Adjust priority order if needed
   - Manual resolution may be required

2. **State mismatches:**
   - Check entity exists on all platforms
   - Verify IDs are correct
   - Run manual sync: `curl -X POST .../api/sync`

3. **Propagation delays:**
   - Wait for next validation cycle (6 hours)
   - Or trigger manual validation

---

### 5. Validation Failures

**Symptoms:**
- Actions marked as "Failed"
- Validation errors in logs

**Diagnosis:**
```bash
# Check validation logs
grep "validation" logs/app.log

# Get buffer stats
curl https://your-app.com/api/status
```

**Solutions:**

1. **Entity not found:**
   - Entity may have been deleted
   - Update Action Log to mark as deleted
   - Clean up orphaned references

2. **Permission errors:**
   - Check API token scopes
   - Verify access to entities
   - Update tokens if necessary

3. **Network errors:**
   - Retry validation: `curl -X POST .../api/validate`
   - Check platform API status pages

---

### 6. Missing Dependencies

**Symptoms:**
- Build failures
- Module not found errors

**Solutions:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

### 7. Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs sync-buffer

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Environment variables not loading:**
```bash
# Verify .env file exists
ls -la .env

# Check docker-compose.yml env_file setting
# Or pass variables explicitly
```

---

## Debug Mode

### Enable Verbose Logging

Edit `.env`:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### View Real-time Logs

```bash
# Local
npm run dev

# Docker
docker-compose logs -f sync-buffer

# Railway
railway logs

# Render
# View logs in Render dashboard
```

---

## Getting Help

### Check Documentation

1. [README.md](../README.md) - Overview and setup
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options
3. [API.md](./API.md) - API reference

### Debug Checklist

- [ ] Environment variables set correctly
- [ ] API tokens valid and not expired
- [ ] Server publicly accessible
- [ ] Webhooks registered on platforms
- [ ] Notion database shared with integration
- [ ] All dependencies installed
- [ ] Application running without errors

### Contact Support

- **Email**: victicnor@gmail.com
- **GitHub Issues**: https://github.com/Trancendos/platform-sync-buffer/issues
- **Linear**: Create issue in TRA team

---

## Performance Optimization

### Slow Validation

**Solutions:**
- Reduce validation scope
- Add caching layer (Redis)
- Optimize database queries
- Parallel validation

### High Memory Usage

**Solutions:**
- Limit concurrent operations
- Add pagination for large datasets
- Clear old logs periodically
- Increase container memory

### Webhook Delays

**Solutions:**
- Use queue system (Bull, BullMQ)
- Separate webhook receiver from processor
- Scale horizontally with load balancer

---

## Maintenance Tasks

### Weekly

- Review conflict log
- Check sync success rates
- Update any failed actions

### Monthly

- Update dependencies: `npm update`
- Review security advisories: `npm audit`
- Rotate webhook secrets
- Archive old Action Log entries

### Quarterly

- Review and optimize sync rules
- Performance audit
- Update documentation
- Review platform API changes
