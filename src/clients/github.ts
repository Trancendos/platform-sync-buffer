import { Octokit } from '@octokit/rest';
import { logger } from '../utils/logger';

const github = new Octokit({ auth: process.env.GITHUB_TOKEN });
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Trancendos';

export const githubClient = {
  async getIssue(repo: string, issueNumber: number) {
    try {
      const { data } = await github.issues.get({
        owner: GITHUB_OWNER,
        repo,
        issue_number: issueNumber
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get GitHub issue ${repo}#${issueNumber}:`, error);
      return null;
    }
  },

  async getPullRequest(repo: string, prNumber: number) {
    try {
      const { data } = await github.pulls.get({
        owner: GITHUB_OWNER,
        repo,
        pull_number: prNumber
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get GitHub PR ${repo}#${prNumber}:`, error);
      return null;
    }
  },

  async updateIssueLabels(repo: string, issueNumber: number, labels: string[]) {
    try {
      await github.issues.setLabels({
        owner: GITHUB_OWNER,
        repo,
        issue_number: issueNumber,
        labels
      });
      logger.info(`Updated labels for ${repo}#${issueNumber}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update labels for ${repo}#${issueNumber}:`, error);
      return false;
    }
  },

  async createIssueComment(repo: string, issueNumber: number, body: string) {
    try {
      await github.issues.createComment({
        owner: GITHUB_OWNER,
        repo,
        issue_number: issueNumber,
        body
      });
      logger.info(`Created comment on ${repo}#${issueNumber}`);
      return true;
    } catch (error) {
      logger.error(`Failed to create comment on ${repo}#${issueNumber}:`, error);
      return false;
    }
  },

  async getCommit(repo: string, sha: string) {
    try {
      const { data } = await github.repos.getCommit({
        owner: GITHUB_OWNER,
        repo,
        ref: sha
      });
      return data;
    } catch (error) {
      logger.error(`Failed to get commit ${repo}@${sha}:`, error);
      return null;
    }
  }
};
