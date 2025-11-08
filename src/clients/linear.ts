import { LinearClient } from '@linear/sdk';
import { logger } from '../utils/logger';

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'TRA';

export const linearClient = {
  async getIssue(issueId: string) {
    try {
      const issue = await linear.issue(issueId);
      return issue;
    } catch (error) {
      logger.error(`Failed to get Linear issue ${issueId}:`, error);
      return null;
    }
  },

  async getIssueByIdentifier(identifier: string) {
    try {
      const issues = await linear.issues({
        filter: {
          team: { key: { eq: TEAM_KEY } },
          number: { eq: parseInt(identifier.split('-')[1]) }
        }
      });
      
      const issuesArray = await issues.nodes;
      return issuesArray.length > 0 ? issuesArray[0] : null;
    } catch (error) {
      logger.error(`Failed to get Linear issue by identifier ${identifier}:`, error);
      return null;
    }
  },

  async createComment(issueId: string, body: string) {
    try {
      await linear.createComment({
        issueId,
        body
      });
      logger.info(`Created comment on Linear issue ${issueId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to create comment on Linear issue ${issueId}:`, error);
      return false;
    }
  },

  async updateIssueState(issueId: string, stateId: string) {
    try {
      await linear.updateIssue(issueId, {
        stateId
      });
      logger.info(`Updated state for Linear issue ${issueId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update state for Linear issue ${issueId}:`, error);
      return false;
    }
  },

  async getTeamStates(teamId: string) {
    try {
      const team = await linear.team(teamId);
      const states = await team.states();
      return states.nodes;
    } catch (error) {
      logger.error(`Failed to get team states:`, error);
      return [];
    }
  }
};
