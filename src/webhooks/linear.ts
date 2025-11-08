import { Request, Response } from 'express';
import { notionClient } from '../clients/notion';
import { logger } from '../utils/logger';
import { syncWorker } from '../workers/sync-worker';

export async function linearWebhook(req: Request, res: Response) {
  try {
    const payload = req.body;
    const event = payload.type;

    logger.info(`Received Linear ${event} event`);

    // Parse Linear webhook
    let actionType = 'Update';
    let entityType = 'Issue';
    let entityId = '';
    let description = '';
    let linearId = '';

    if (payload.data) {
      const data = payload.data;
      
      switch (payload.action) {
        case 'create':
          actionType = 'Create';
          break;
        case 'update':
          actionType = 'Update';
          break;
        case 'remove':
          actionType = 'Delete';
          break;
      }

      if (data.identifier) {
        entityId = data.identifier; // e.g., TRA-49
        linearId = data.id;
        description = `${payload.action} ${event}: ${data.title || data.name || entityId}`;
      }
    }

    // Log to Notion buffer
    await notionClient.logAction({
      platform: 'Linear',
      actionType,
      entityType,
      entityId,
      description,
      linearId,
      timestamp: new Date().toISOString()
    });

    // Trigger sync if enabled
    if (process.env.SYNC_ENABLED === 'true') {
      await syncWorker.syncFromLinear(event, payload);
    }

    res.json({ received: true, logged: true });
  } catch (error) {
    logger.error('Linear webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
