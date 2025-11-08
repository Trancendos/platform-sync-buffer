import { githubClient } from '../clients/github';
import { linearClient } from '../clients/linear';
import { notionClient } from '../clients/notion';
import { extractors } from '../utils/extractors';
import { logger } from '../utils/logger';

export const syncOrchestrator = {
  async syncGitHubToLinear(repo: string, issueOrPr: any, eventType: string) {
    try {
      const linearRefs = extractors.extractLinearRefs(
        `${issueOrPr.title} ${issueOrPr.body || ''}`
      );

      for (const ref of linearRefs) {
        const issue = await linearClient.getIssueByIdentifier(ref);
        
        if (issue) {
          let comment = '';
          
          if (eventType === 'issues.opened') {
            comment = `🔗 GitHub Issue Created: [${repo}#${issueOrPr.number}](${issueOrPr.html_url})\n\n${issueOrPr.title}`;
          } else if (eventType === 'pull_request.opened') {
            comment = `🔀 GitHub PR Opened: [${repo}#${issueOrPr.number}](${issueOrPr.html_url})\n\n${issueOrPr.title}`;
          } else if (eventType === 'pull_request.closed' && issueOrPr.merged) {
            comment = `✅ GitHub PR Merged: [${repo}#${issueOrPr.number}](${issueOrPr.html_url})`;
            
            // Move issue to Done if configured
            const states = await linearClient.getTeamStates(issue.teamId);
            const doneState = states.find(s => s.type === 'completed');
            
            if (doneState) {
              await linearClient.updateIssueState(issue.id, doneState.id);
            }
          }

          if (comment) {
            await linearClient.createComment(issue.id, comment);
          }
        }
      }

      logger.info(`Synced GitHub ${repo}#${issueOrPr.number} to Linear`);
    } catch (error) {
      logger.error('GitHub to Linear sync error:', error);
      throw error;
    }
  },

  async syncLinearToGitHub(linearIssue: any, eventType: string) {
    try {
      // Extract GitHub references from Linear issue
      const description = linearIssue.description || '';
      const githubRefs = extractors.extractGitHubRefs(description);

      for (const ref of githubRefs) {
        if (ref.repo && ref.number) {
          const [owner, repo] = ref.repo.split('/');
          
          // Update GitHub issue labels based on Linear state
          const labels = this.mapLinearStateToGitHubLabels(linearIssue.state);
          
          if (labels.length > 0) {
            await githubClient.updateIssueLabels(repo, ref.number, labels);
          }

          // Add comment about Linear update
          const comment = `Linear issue updated: [${linearIssue.identifier}](${linearIssue.url})\nStatus: ${linearIssue.state?.name}`;
          await githubClient.createIssueComment(repo, ref.number, comment);
        }
      }

      logger.info(`Synced Linear ${linearIssue.identifier} to GitHub`);
    } catch (error) {
      logger.error('Linear to GitHub sync error:', error);
      throw error;
    }
  },

  mapLinearStateToGitHubLabels(state: any): string[] {
    const labels: string[] = [];

    switch (state?.type) {
      case 'backlog':
        labels.push('status: backlog');
        break;
      case 'unstarted':
        labels.push('status: todo');
        break;
      case 'started':
        labels.push('status: in-progress');
        break;
      case 'completed':
        labels.push('status: done');
        break;
      case 'canceled':
        labels.push('status: canceled');
        break;
    }

    return labels;
  },

  async syncNotionToOthers(notionPage: any) {
    try {
      // Extract references from Notion page
      // Sync documentation to GitHub READMEs and Linear descriptions
      logger.info(`Syncing Notion page ${notionPage.id} to other platforms`);
      // Implementation depends on Notion page structure
    } catch (error) {
      logger.error('Notion to others sync error:', error);
      throw error;
    }
  }
};
