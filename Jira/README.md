 # 📦 Jira Release Ticket Fetcher (Node.js)

This script uses the `jira-connector` library to retrieve all issues from a specific **Jira fixVersion** (e.g., a release version like `1.38.1`) and outputs them in a structured **Markdown format**.

---

## 🔧 Configuration

Edit these values at the top of the script:

```js
const JIRA_DOMAIN = 'your-jira-domain';
const JIRA_EMAIL = 'your-jira-email';
const JIRA_API_TOKEN = 'your-jira-token';
const JIRA_PROJECT_KEY = 'PROJECTKEY';
const FIX_VERSION = '1.38.1';
```

> ⚠️ **Important Fixes Needed**:
>
> * `BASE_TICKET_URL` must use backticks and string template: ``const BASE_TICKET_URL = `https://${JIRA_DOMAIN}/browse/`;``
> * `jql` line must use backticks and template string: ``const jql = `project = "${projectKey}" AND fixVersion = "${fixVersionName}" ORDER BY created ASC`;``
> * All `console.log(...)` calls using template strings must use backticks (`` ` ``) instead of quotes.

---

## 🧠 What This Script Does

1. Initializes a Jira API client using your credentials.
2. Builds a JQL query to filter issues by project key and fixVersion.
3. Fetches up to 100 issues and maps each issue's key metadata:

   * Key, Summary, Type, Status, Priority
   * Assignee, Reporter, Created / Updated timestamps
   * Labels and specific custom fields like:

     * `customfield_11210`: Product Item
     * `customfield_11211`: Environment
     * `customfield_11215`: Feature
     * `customfield_11179`: Testing Version
4. Outputs each issue in Markdown format for easy inclusion in:

   * Release notes
   * QA test plans
   * GitHub comments
   * Confluence pages

---

## 🖥 Example Markdown Output

```markdown
### 1. [PROJECTKEY-2036](https://your-jira-domain/browse/PROJECTKEY-2036) - Feature Title
- **Type**: Feature
- **Status**: READY FOR QA
- **Priority**: Medium
- **Assignee**: Unassigned
- **Reporter**: Unknown
- **Created**: 2024-11-12T03:22:18.456+0000
- **Updated**: 2024-12-01T10:03:18.289+0000
- **Labels**: internal, frontend
- **Product Item**: Internal Tool
- **Environment**: Staging
- **Feature**: Sync Capability
- **Testing Version**: 1.38.1-build-202506091647
```

---

## 📦 Installation

```bash
npm install
```

---

## ▶️ Run It

```bash
node fetch-release-tickets > release-notes.md
```

Or pipe it directly into Slack, GitHub comment, etc.

---

## 🔄 Future Improvements

* Write output to Markdown file using `fs.writeFileSync()`
* Send output as HTML email with `nodemailer`
* Upload result to Confluence via API
* Slack webhook integration for release notifications


