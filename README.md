# Rarefriend Skills

Claude Code skills for [Rarefriend](https://rarefriend.com) — your personal CRM.

Each skill is a focused SKILL.md that teaches your AI assistant a specific Rarefriend capability. Install only what you need, or install all of them.

## Available skills

| Skill                                              | What it does                                       |
| -------------------------------------------------- | -------------------------------------------------- |
| `rarefriend-personal-network-manager`              | Full CRM — contacts, notes, tags, all integrations |
| `rarefriend-linkedin-connection-management`        | Search and manage LinkedIn-synced connections      |
| `rarefriend-google-calendar`                       | Google Calendar scheduling and availability        |
| `rarefriend-google-contacts`                       | Google Contacts sync and management                |
| `rarefriend-microsoft-contact-calendar-management` | Microsoft Outlook contacts and calendar            |
| `rarefriend-microsoft-email`                       | Microsoft email search and management              |

## Install

**All skills:**

```bash
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-personal-network-manager
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-linkedin-connection-management
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-google-calendar
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-google-contacts
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-microsoft-contact-calendar-management
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-microsoft-email
```

**Just the main skill (recommended starting point):**

```bash
npx skills add Whitefield-Labs/rarefriend-skills --skill rarefriend-personal-network-manager
```

> **Note:** The `--all` flag installs only the first skill due to a known CLI bug ([#1015](https://github.com/anthropics/claude-code/issues/1015)). Use `--skill <name>` for each one until the bug is fixed.

## Requirements

You need the Rarefriend MCP connected to your AI client first:

```bash
# Claude Code
claude mcp add rarefriend -e RAREFRIEND_CLIENT_ID=your-id -e RAREFRIEND_CLIENT_SECRET=your-secret -- npx -y @rarefriend-ai/mcp
```

Get credentials at [rarefriend.com](https://rarefriend.com) → Settings → Integrations → MCP.

For Cursor and Claude Desktop setup, see the [MCP repo](https://github.com/Whitefield-Labs/rarefriend-mcp).

## License

MIT
