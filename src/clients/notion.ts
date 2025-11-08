import { Client } from '@notionhq/client';
import { logger } from '../utils/logger';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const BUFFER_DB_ID = process.env.NOTION_BUFFER_DB_ID || '';

interface ActionLog {
  platform: 'GitHub' | 'Linear' | 'Notion';
  actionType: 'Create' | 'Update' | 'Delete' | 'Sync';
  entityType: 'Issue' | 'PR' | 'Page' | 'Database' | 'Commit';
  entityId: string;
  description: string;
  githubId?: string;
  linearId?: string;
  notionId?: string;
  timestamp: string;
  syncStatus?: 'Pending' | 'Synced' | 'Failed' | 'Conflict';
  errorLog?: string;
}

export const notionClient = {
  async logAction(action: ActionLog) {
    try {
      const response = await notion.pages.create({
        parent: { database_id: BUFFER_DB_ID },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: `${action.platform} ${action.actionType} - ${action.entityId}`
                }
              }
            ]
          },
          Platform: {
            select: { name: action.platform }
          },
          'Action Type': {
            select: { name: action.actionType }
          },
          'Entity Type': {
            select: { name: action.entityType }
          },
          'Entity ID': {
            rich_text: [
              {
                text: { content: action.entityId }
              }
            ]
          },
          Description: {
            rich_text: [
              {
                text: { content: action.description }
              }
            ]
          },
          'GitHub ID': action.githubId ? {
            rich_text: [{ text: { content: action.githubId } }]
          } : undefined,
          'Linear ID': action.linearId ? {
            rich_text: [{ text: { content: action.linearId } }]
          } : undefined,
          'Notion ID': action.notionId ? {
            rich_text: [{ text: { content: action.notionId } }]
          } : undefined,
          'Action Timestamp': {
            date: { start: action.timestamp }
          },
          'Sync Status': {
            select: { name: action.syncStatus || 'Pending' }
          },
          'Validation Status': {
            checkbox: false
          }
        }
      });

      logger.info(`Logged action to Notion: ${action.entityId}`);
      return response.id;
    } catch (error) {
      logger.error('Failed to log action to Notion:', error);
      throw error;
    }
  },

  async updateActionStatus(pageId: string, status: string, validated: boolean, errorLog?: string) {
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          'Sync Status': {
            select: { name: status }
          },
          'Validation Status': {
            checkbox: validated
          },
          'Last Validated': {
            date: { start: new Date().toISOString() }
          },
          'Error Log': errorLog ? {
            rich_text: [{ text: { content: errorLog } }]
          } : undefined
        }
      });

      logger.info(`Updated action status: ${pageId}`);
    } catch (error) {
      logger.error('Failed to update action status:', error);
    }
  },

  async queryActions(filters?: any) {
    try {
      const response = await notion.databases.query({
        database_id: BUFFER_DB_ID,
        filter: filters
      });

      return response.results;
    } catch (error) {
      logger.error('Failed to query actions:', error);
      return [];
    }
  }
};
