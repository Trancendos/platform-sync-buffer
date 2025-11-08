#!/usr/bin/env node

require('dotenv').config();
const { Client: NotionClient } = require('@notionhq/client');
const { Octokit } = require('@octokit/rest');
const { LinearClient } = require('@linear/sdk');

const {
  GITHUB_TOKEN,
  LINEAR_API_KEY,
  NOTION_INTEGRATION_TOKEN,
  NOTION_ACTION_LOG_DATABASE_ID
} = process.env;

async function validateSetup() {
  console.log('\n🔍 Validating Platform Sync Buffer Setup\n');

  let errors = 0;

  // Test GitHub
  console.log('Testing GitHub connection...');
  try {
    const github = new Octokit({ auth: GITHUB_TOKEN });
    const { data: user } = await github.users.getAuthenticated();
    console.log(`  ✓ GitHub authenticated as: ${user.login}`);
  } catch (error) {
    console.error('  ✗ GitHub authentication failed:', error.message);
    errors++;
  }

  // Test Linear
  console.log('\nTesting Linear connection...');
  try {
    const linear = new LinearClient({ apiKey: LINEAR_API_KEY });
    const me = await linear.viewer;
    console.log(`  ✓ Linear authenticated as: ${me.name}`);
  } catch (error) {
    console.error('  ✗ Linear authentication failed:', error.message);
    errors++;
  }

  // Test Notion
  console.log('\nTesting Notion connection...');
  try {
    const notion = new NotionClient({ auth: NOTION_INTEGRATION_TOKEN });
    const database = await notion.databases.retrieve({
      database_id: NOTION_ACTION_LOG_DATABASE_ID
    });
    console.log(`  ✓ Notion database accessible: ${database.title[0]?.plain_text || 'Action Log'}`);
  } catch (error) {
    console.error('  ✗ Notion connection failed:', error.message);
    errors++;
  }

  console.log('\n' + '='.repeat(50));

  if (errors === 0) {
    console.log('\n✅ All systems validated successfully!\n');
    console.log('You can now:');
    console.log('1. Deploy the application');
    console.log('2. Register webhooks with: node scripts/register-webhooks.js');
    console.log('3. Start monitoring your Action Log\n');
  } else {
    console.error(`\n❌ Validation failed with ${errors} error(s)\n`);
    console.error('Please check your API tokens and permissions\n');
    process.exit(1);
  }
}

validateSetup().catch(console.error);
