# Rarefriend for Claude

Search your professional network, log notes, tag contacts, and schedule meetings with
Google Calendar or Outlook, all from Claude, powered by [Rarefriend](https://rarefriend.com).

## Install

```
/plugin marketplace add Whitefield-Labs/rarefriend-skills
/plugin install rarefriend@rarefriend
```

You are asked for your Client ID and Client Secret when the plugin is turned on.

## Credentials

1. Sign in at [rarefriend.com](https://rarefriend.com).
2. Go to **Settings → Integrations → MCP** and create a client.
3. Create a **full-access** client. Adding notes, tags, contacts and calendar events needs
   write access, so a read-only client limits what the plugin can do.
4. Paste the Client ID and Client Secret when Claude asks. The secret is stored in your
   system keychain.

## Troubleshooting

- Run `/mcp` to check that `rarefriend` is connected.
- Change your credentials with `/plugin configure rarefriend@rarefriend`, then run `/reload-plugins`.
- Node.js 18 or newer is required, because the connection runs through `npx`.

## Maintainers

Bump `version` in `.claude-plugin/plugin.json` in any PR that changes plugin files or the
skills. Installed users only receive an update when the version changes. CI enforces this
(`scripts/check-version-bump.sh`); changes to this README, the manifest or `scripts/` alone do
not need a bump.

`.mcp.json` pins `@rarefriend-ai/mcp` to an exact version, because the proxy receives the
user's client secret. When you publish a new MCP server version, update the pin and bump the
plugin `version` in the same PR, after testing that exact version.

Skills are not committed here. `scripts/build-plugin.sh` copies them from
`packages/mcp-server/skills/`.
