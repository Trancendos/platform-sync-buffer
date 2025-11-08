import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { githubWebhook } from './webhooks/github';
import { linearWebhook } from './webhooks/linear';
import { validationService } from './services/validation';
import { syncWorker } from './workers/sync-worker';
import { notionPoller } from './workers/notion-poller';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Webhook endpoints
app.post('/webhook/github', githubWebhook);
app.post('/webhook/linear', linearWebhook);

// Manual operation endpoints
app.post('/api/validate', async (req, res) => {
  try {
    await validationService.runValidation();
    res.json({ success: true, message: 'Validation completed' });
  } catch (error) {
    logger.error('Manual validation failed:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const { entityId, entityType } = req.body;
    await syncWorker.syncEntity(entityId, entityType);
    res.json({ success: true, message: 'Sync completed' });
  } catch (error) {
    logger.error('Manual sync failed:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    const stats = await validationService.getBufferStats();
    res.json(stats);
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Platform Sync Buffer running on port ${PORT}`);
});

// Schedule validation service (every 6 hours)
const validationSchedule = process.env.VALIDATION_SCHEDULE || '0 */6 * * *';
cron.schedule(validationSchedule, async () => {
  logger.info('Running scheduled validation');
  await validationService.runValidation();
});

// Start Notion poller (every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  await notionPoller.poll();
});

logger.info('Platform Sync Buffer initialized successfully');
