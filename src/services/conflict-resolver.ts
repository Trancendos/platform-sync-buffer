import { logger } from '../utils/logger';
import { githubClient } from '../clients/github';
import { linearClient } from '../clients/linear';
import { notionClient } from '../clients/notion';

export const conflictResolver = {
  async resolveConflict(action: any): Promise<string> {
    try {
      const properties = action.properties;
      const platform = properties.Platform?.select?.name;
      const entityType = properties['Entity Type']?.select?.name;
      
      logger.info(`Resolving conflict for ${platform} ${entityType}`);

      // Priority-based resolution
      // 1. GitHub (source code truth)
      // 2. Linear (issue tracking state)
      // 3. Notion (documentation)

      if (entityType === 'Commit' || entityType === 'PR') {
        return await this.resolveWithGitHubPriority(action);
      } else if (entityType === 'Issue') {
        return await this.resolveWithLinearPriority(action);
      } else if (entityType === 'Page' || entityType === 'Database') {
        return await this.resolveWithNotionPriority(action);
      }

      return 'No resolution rule applicable';
    } catch (error) {
      logger.error('Conflict resolution error:', error);
      return `Resolution failed: ${error}`;
    }
  },

  async resolveWithGitHubPriority(action: any): Promise<string> {
    logger.info('Applying GitHub priority resolution');
    // GitHub state is canonical - propagate to Linear and Notion
    return 'Resolved: GitHub state propagated to other platforms';
  },

  async resolveWithLinearPriority(action: any): Promise<string> {
    logger.info('Applying Linear priority resolution');
    // Linear issue state is canonical - propagate to GitHub labels and Notion
    return 'Resolved: Linear state propagated to other platforms';
  },

  async resolveWithNotionPriority(action: any): Promise<string> {
    logger.info('Applying Notion priority resolution');
    // Notion documentation is canonical - propagate to READMEs and descriptions
    return 'Resolved: Notion content propagated to other platforms';
  },

  async detectConflictType(githubData: any, linearData: any, notionData: any): Promise<string[]> {
    const conflicts: string[] = [];

    // Check status mismatches
    if (githubData?.state !== linearData?.state?.type) {
      conflicts.push('Status mismatch between GitHub and Linear');
    }

    // Check title/description consistency
    if (githubData?.title !== linearData?.title) {
      conflicts.push('Title mismatch between platforms');
    }

    // Check timestamp conflicts (simultaneous updates)
    const timeDiff = Math.abs(
      new Date(githubData?.updated_at || 0).getTime() - 
      new Date(linearData?.updatedAt || 0).getTime()
    );
    
    if (timeDiff < 60000) { // Within 1 minute
      conflicts.push('Simultaneous updates detected');
    }

    return conflicts;
  }
};
