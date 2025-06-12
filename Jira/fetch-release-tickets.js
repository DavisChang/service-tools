import JiraClient from 'jira-connector';

// 🔧 Jira 參數設定
const JIRA_DOMAIN = 'your-jira-domain';
const JIRA_EMAIL = 'your-jira-email';
const JIRA_API_TOKEN = 'your-jira-token';
const JIRA_PROJECT_KEY = 'VSFT';
const FIX_VERSION = '1.38.1';  // Release Version
const BASE_TICKET_URL = `https://${JIRA_DOMAIN}/browse/`;

// 初始化 Jira client
const jira = new JiraClient({
  host: JIRA_DOMAIN,
  basic_auth: {
    email: JIRA_EMAIL,
    api_token: JIRA_API_TOKEN,
  },
});

async function fetchFullTickets(projectKey, fixVersionName) {
  const jql = `project = "${projectKey}" AND fixVersion = "${fixVersionName}" ORDER BY created ASC`;

  const result = await jira.search.search({
    jql,
    maxResults: 100,
    expand: ['names', 'schema'], // optional, more metadata
  });

  return result.issues.map(issue => {
    const f = issue.fields;
    return {
      key: issue.key,
      url: `${BASE_TICKET_URL}${issue.key}`,
      type: f.issuetype.name,
      status: f.status.name,
      priority: f.priority?.name || 'N/A',
      summary: f.summary,
      description: f.description || '',
      assignee: f.assignee?.displayName || 'Unassigned',
      reporter: f.reporter?.displayName || 'Unknown',
      created: f.created,
      updated: f.updated,
      labels: f.labels,
      rawFields: f // ← ⭐ All detail custom fields
    };
  });
}

async function main() {
  try {
    const tickets = await fetchFullTickets(JIRA_PROJECT_KEY, FIX_VERSION);

    console.log(`Total ${tickets.length} issues in version "${FIX_VERSION}":\n`);

    tickets.forEach((ticket, i) => {
      // console.log('ticket:', ticket)
      console.log(`${i + 1}. [${ticket.type}] ${ticket.key} - ${ticket.summary}`);
      console.log(`   🧾 Status: ${ticket.status}`);
      console.log(`   🧾 Priority: ${ticket.priority}`);
      console.log(`   👤 Assignee: ${ticket.assignee}`);
      console.log(`   👤 Reporter: ${ticket.reporter}`);
      console.log(`   🕒 Created: ${ticket.created}`);
      console.log(`   🔄 Updated: ${ticket.updated}`);
      console.log(`   🏷  Labels: ${ticket.labels.join(', ') || 'None'}`);

      console.log(`   📦 [Product Item]: ${ticket.rawFields.customfield_11210}`);
      console.log(`   📦 [Environment]: ${ticket.rawFields.customfield_11211}`);
      console.log(`   📦 [Feature]: ${ticket.rawFields.customfield_11215}`);
      console.log(`   📦 [Testing version]: ${ticket.rawFields.customfield_11179}`);

      console.log(`   🔗 ${ticket.url}`);
      console.log('');
    });

    // Optional: You can use these tickets to generate JSON or CSV...
    // console.log(JSON.stringify(tickets, null, 2));
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
