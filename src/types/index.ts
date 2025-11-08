export interface ActionLog {
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

export interface SyncMapping {
  githubRepo?: string;
  githubIssueNumber?: number;
  githubPrNumber?: number;
  linearIssueId?: string;
  linearIdentifier?: string;
  notionPageId?: string;
}

export interface ValidationResult {
  validated: boolean;
  syncStatus: 'Pending' | 'Synced' | 'Failed' | 'Conflict';
  errorLog?: string;
  conflicts?: string[];
}

export interface BufferStats {
  total: number;
  pending: number;
  synced: number;
  failed: number;
  conflicts: number;
  validated: number;
  lastValidation?: string;
}
