#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const { Octokit } = require('@octokit/rest');

const {
  GITHUB_TOKEN,
  GITHUB_OWNER = 'Trancendos',
  LINEAR_API_KEY,
  SERVER_BASE_URL,
  WEBHOOK_SECRET
} = process.env;

if (!GITHUB_TOKEN || !LINEAR_API_KEY || !SERVER_BASE_URL || !WEBHOOK_SECRET) {
  console.error('Missing required environment variables!');
  console.error('Required: GITHUB_TOKEN, LINEAR_API_KEY, SERVER_BASE_URL, WEBHOOK_SECRET');
  process.exit(1);
}

const github = new Octokit({ auth: GITHUB_TOKEN });

async function registerGitHubWebhooks() {
  console.log('\n=== Registering GitHub Webhooks ===\n');

  try {
    // Get all repositories
    const { data: repos } = await github.repos.listForAuthenticatedUser({
      per_page: 100,
      affiliation: 'owner'
    });

    console.log(`Found ${repos.length} repositories\n`);

    for (const repo of repos) {
      if (repo.owner.login !== GITHUB_OWNER) continue;

      try {
        // Check if webhook already exists
        const { data: hooks } = await github.repos.listWebhooks({
          owner: repo.owner.login,
          repo: repo.name
        });

        const existingHook = hooks.find(h => 
          h.config.url === `${SERVER_BASE_URL}/webhook/github`
        );

        if (existingHook) {
          console.log(`  ✓ ${repo.name}: Webhook already exists (ID: ${existingHook.id})`);
          continue;
        }

        // Create new webhook
        await github.repos.createWebhook({
          owner: repo.owner.login,
          repo: repo.name,
          config: {
            url: `${SERVER_BASE_URL}/webhook/github`,
            content_type: 'json',
            secret: WEBHOOK_SECRET,
            insecure_ssl: '0'
          },
          events: ['push', 'issues', 'pull_request', 'issue_comment', 'pull_request_review'],
          active: true
        });

        console.log(`  ✓ ${repo.name}: Webhook registered successfully`);
      } catch (error) {
        console.error(`  ✗ ${repo.name}: ${error.message}`);
      }
    }

    console.log('\nGitHub webhook registration complete!\n');
  } catch (error) {
    console.error('Failed to register GitHub webhooks:', error.message);
  }
}

async function registerLinearWebhook() {
  console.log('=== Registering Linear Webhook ===\n');

  const mutation = `
    mutation WebhookCreate($input: WebhookCreateInput!) {
      webhookCreate(input: $input) {
        success
        webhook {
          id
          url
          enabled
          resourceTypes
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.linear.app/graphql',
      {
        query: mutation,
        variables: {
          input: {
            url: `${SERVER_BASE_URL}/webhook/linear`,
            resourceTypes: ['Issue', 'Comment', 'Project', 'IssueLabel'],
            enabled: true
          }
        }
      },
      {
        headers: {
          'Authorization': LINEAR_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.data?.webhookCreate?.success) {
      const webhook = response.data.data.webhookCreate.webhook;
      console.log('  ✓ Linear webhook registered successfully');
      console.log(`    ID: ${webhook.id}`);
      console.log(`    URL: ${webhook.url}`);
      console.log(`    Resource Types: ${webhook.resourceTypes.join(', ')}`);
    } else {
      console.error('  ✗ Failed to register Linear webhook');
      console.error('    Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    if (error.response?.data?.errors) {
      console.error('  ✗ Linear API Error:', error.response.data.errors);
    } else {
      console.error('  ✗ Failed to register Linear webhook:', error.message);
    }
  }

  console.log('\nLinear webhook registration complete!\n');
}

async function main() {
  console.log('\n🔄 Platform Sync Buffer - Webhook Registration\n');
  console.log(`Server URL: ${SERVER_BASE_URL}\n`);

  await registerGitHubWebhooks();
  await registerLinearWebhook();

  console.log('\n✅ All webhooks registered!\n');
  console.log('Next steps:');
  console.log('1. Verify webhooks are receiving events');
  console.log('2. Check your Notion Action Log database');
  console.log('3. Monitor logs for any errors');
  console.log('4. Test by creating/updating an issue\n');
}

main().catch(console.error);
