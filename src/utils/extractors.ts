// Utility functions to extract references between platforms

export const extractors = {
  // Extract Linear issue references from text (e.g., TRA-123)
  extractLinearRefs(text: string): string[] {
    const regex = /\b([A-Z]{2,}-\d+)\b/g;
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
  },

  // Extract GitHub issue/PR references (e.g., #123, owner/repo#456)
  extractGitHubRefs(text: string): Array<{repo?: string, number: number}> {
    const refs: Array<{repo?: string, number: number}> = [];
    
    // Match #123 format
    const simpleRegex = /#(\d+)/g;
    let match;
    while ((match = simpleRegex.exec(text)) !== null) {
      refs.push({ number: parseInt(match[1]) });
    }

    // Match owner/repo#123 format
    const fullRegex = /([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)#(\d+)/g;
    while ((match = fullRegex.exec(text)) !== null) {
      refs.push({ 
        repo: `${match[1]}/${match[2]}`,
        number: parseInt(match[3]) 
      });
    }

    return refs;
  },

  // Extract Notion page IDs from URLs
  extractNotionPageIds(text: string): string[] {
    const regex = /notion\.so\/([a-f0-9]{32})/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    
    return [...new Set(matches)];
  },

  // Parse commit message for semantic information
  parseCommitMessage(message: string) {
    const lines = message.split('\n');
    const subject = lines[0];
    const body = lines.slice(1).join('\n').trim();

    // Detect conventional commit type
    const typeMatch = subject.match(/^(feat|fix|docs|style|refactor|test|chore|perf)(\(.+\))?:/);
    const type = typeMatch ? typeMatch[1] : 'other';

    return {
      subject,
      body,
      type,
      linearRefs: this.extractLinearRefs(message),
      githubRefs: this.extractGitHubRefs(message)
    };
  }
};
