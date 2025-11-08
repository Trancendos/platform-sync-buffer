import { Octokit } from '@octokit/rest';
import { LinearClient } from '@linear/sdk';
import { notionClient } from '../clients/notion';
import { logger } from '../utils/logger';

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

export const syncWorker = {
  async syncFromGitHub(event: string, payload: any) {
    try {
      logger.info(`Syncing from GitHub: ${event}`);

      // Extract Linear issue references from commits/PR
      const linearRefs = this.extractLinearRefs(payload);

      for (const ref of linearRefs) {
        await this.updateLinearFromGitHub(ref, event, payload);
      }
    } catch (error) {
      logger.error('GitHub sync error:', error);
    }
  },

  async syncFromLinear(event: string, payload: any) {
    try {
      logger.info(`Syncing from Linear: ${event}`);

      // Update GitHub labels/status based on Linear changes
      if (payload.data?.identifier) {
        await this.updateGitHubFromLinear(payload.data);
      }
    } catch (error) {
      logger.error('Linear sync error:', error);
    }
  },

  extractLinearRefs(payload: any): string[] {
    const refs: string[] = [];
    const regex = /\b(TRA-\d+)\b/g;

    // Check commits
    if (payload.commits) {
      payload.commits.forEach((commit: any) => {
        const matches = commit.message.match(regex);
        if (matches) refs.push(...matches);
      });
    }

    // Check PR body
    if (payload.pull_request?.body) {
      const matches = payload.pull_request.body.match(regex);
      if (matches) refs.push(...matches);
    }

    return [...new Set(refs)];
  },

  async updateLinearFromGitHub(linearRef: string, event: string, payload: any) {
    try {
      const issue = await linear.issue(linearRef);
      
      if (!issue) {
        logger.warn(`Linear issue not found: ${linearRef}`);
        return;
      }

      // Update Linear issue based on GitHub event
      let comment = '';

      if (event === 'push') {
        comment = `GitHub commits pushed: ${payload.commits?.length || 0} commits to ${payload.ref}`;
      } else if (event === 'pull_request' && payload.action === 'opened') {
        comment = `GitHub PR opened: #${payload.pull_request.number} - ${payload.pull_request.title}`;
      } else if (event === 'pull_request' && payload.action === 'closed' && payload.pull_request.merged) {
        comment = `GitHub PR merged: #${payload.pull_request.number}`;
        // Optionally move issue to Done
      }

      if (comment) {
        await linear.createComment({
          issueId: issue.id,
          body: comment
        });

        logger.info(`Updated Linear issue ${linearRef} from GitHub`);
      }
    } catch (error) {
      logger.error(`Failed to update Linear ${linearRef}:`, error);
    }
  },

  async updateGitHubFromLinear(linearData: any) {
    try {
      // Find related GitHub issues/PRs
      // Update labels, status, etc.
      logger.info(`GitHub update from Linear: ${linearData.identifier}`);
    } catch (error) {
      logger.error('Failed to update GitHub from Linear:', error);
    }
  },

  async syncEntity(entityId: string, entityType: string) {
    logger.info(`Manual sync requested: ${entityType} ${entityId}`);
    // Implement manual sync logic
  }
};
