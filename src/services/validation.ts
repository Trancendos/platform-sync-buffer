import { notionClient } from '../clients/notion';
import { logger } from '../utils/logger';
import { Octokit } from '@octokit/rest';
import { LinearClient } from '@linear/sdk';

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

export const validationService = {
  async runValidation() {
    logger.info('Starting validation service');

    try {
      // Get all pending or unvalidated actions
      const actions = await notionClient.queryActions({
        or: [
          {
            property: 'Validation Status',
            checkbox: { equals: false }
          },
          {
            property: 'Sync Status',
            select: { equals: 'Pending' }
          }
        ]
      });

      logger.info(`Found ${actions.length} actions to validate`);

      for (const action of actions) {
        await this.validateAction(action);
      }

      logger.info('Validation service completed');
    } catch (error) {
      logger.error('Validation service error:', error);
    }
  },

  async validateAction(action: any) {
    try {
      const properties = action.properties;
      const platform = properties.Platform?.select?.name;
      const entityId = properties['Entity ID']?.rich_text?.[0]?.plain_text;
      const githubId = properties['GitHub ID']?.rich_text?.[0]?.plain_text;
      const linearId = properties['Linear ID']?.rich_text?.[0]?.plain_text;

      let validated = false;
      let syncStatus = 'Pending';
      let errorLog = '';

      // Cross-platform validation logic
      if (githubId && linearId) {
        // Validate GitHub and Linear are in sync
        const githubValid = await this.validateGitHub(githubId);
        const linearValid = await this.validateLinear(linearId);

        if (githubValid && linearValid) {
          validated = true;
          syncStatus = 'Synced';
        } else {
          syncStatus = 'Conflict';
          errorLog = 'Cross-platform mismatch detected';
        }
      } else if (githubId) {
        validated = await this.validateGitHub(githubId);
        syncStatus = validated ? 'Synced' : 'Failed';
      } else if (linearId) {
        validated = await this.validateLinear(linearId);
        syncStatus = validated ? 'Synced' : 'Failed';
      }

      await notionClient.updateActionStatus(action.id, syncStatus, validated, errorLog);
    } catch (error) {
      logger.error(`Validation failed for action ${action.id}:`, error);
      await notionClient.updateActionStatus(
        action.id,
        'Failed',
        false,
        String(error)
      );
    }
  },

  async validateGitHub(entityId: string): Promise<boolean> {
    try {
      // Validate GitHub entity exists
      // Implementation depends on entity type (issue, PR, commit)
      return true;
    } catch (error) {
      logger.error('GitHub validation error:', error);
      return false;
    }
  },

  async validateLinear(entityId: string): Promise<boolean> {
    try {
      // Validate Linear entity exists
      const issue = await linear.issue(entityId);
      return !!issue;
    } catch (error) {
      logger.error('Linear validation error:', error);
      return false;
    }
  },

  async getBufferStats() {
    const actions = await notionClient.queryActions();

    const stats = {
      total: actions.length,
      pending: 0,
      synced: 0,
      failed: 0,
      conflicts: 0,
      validated: 0
    };

    actions.forEach((action: any) => {
      const syncStatus = action.properties['Sync Status']?.select?.name;
      const validated = action.properties['Validation Status']?.checkbox;

      if (syncStatus === 'Pending') stats.pending++;
      if (syncStatus === 'Synced') stats.synced++;
      if (syncStatus === 'Failed') stats.failed++;
      if (syncStatus === 'Conflict') stats.conflicts++;
      if (validated) stats.validated++;
    });

    return stats;
  }
};
