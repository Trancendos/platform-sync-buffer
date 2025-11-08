import { Request, Response } from 'express';
import crypto from 'crypto';
import { notionClient } from '../clients/notion';
import { logger } from '../utils/logger';
import { syncWorker } from '../workers/sync-worker';

export async function githubWebhook(req: Request, res: Response) {
  try {
    // Verify webhook signature
    const signature = req.headers['x-hub-signature-256'] as string;
    const secret = process.env.WEBHOOK_SECRET || '';
    const hash = 'sha256=' + crypto.createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== hash) {
      logger.warn('Invalid GitHub webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.headers['x-github-event'] as string;
    const payload = req.body;

    logger.info(`Received GitHub ${event} event`);

    // Register action in buffer
    let actionType = 'Update';
    let entityType = 'Commit';
    let entityId = '';
    let description = '';

    switch (event) {
      case 'push':
        entityType = 'Commit';
        entityId = payload.after;
        description = `Push to ${payload.ref}: ${payload.commits?.length || 0} commits`;
        break;

      case 'issues':
        actionType = payload.action === 'opened' ? 'Create' : 'Update';
        entityType = 'Issue';
        entityId = `#${payload.issue.number}`;
        description = `Issue ${payload.action}: ${payload.issue.title}`;
        break;

      case 'pull_request':
        actionType = payload.action === 'opened' ? 'Create' : 'Update';
        entityType = 'PR';
        entityId = `#${payload.pull_request.number}`;
        description = `PR ${payload.action}: ${payload.pull_request.title}`;
        break;

      default:
        logger.info(`Unhandled GitHub event type: ${event}`);
        return res.json({ received: true });
    }

    // Log to Notion buffer
    await notionClient.logAction({
      platform: 'GitHub',
      actionType,
      entityType,
      entityId,
      description,
      githubId: entityId,
      timestamp: new Date().toISOString()
    });

    // Trigger sync if enabled
    if (process.env.SYNC_ENABLED === 'true') {
      await syncWorker.syncFromGitHub(event, payload);
    }

    res.json({ received: true, logged: true });
  } catch (error) {
    logger.error('GitHub webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
