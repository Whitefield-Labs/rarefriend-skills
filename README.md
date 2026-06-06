# @rarefriend-ai/mcp

Stdio MCP proxy for [Rarefriend CRM](https://rarefriend.com). Bridges any stdio MCP client (Claude Desktop, Cursor, Claude Code CLI, any agent framework) to the Rarefriend HTTP MCP server using OAuth `client_credentials` — no browser needed.

## Install

No install step. Use directly via `npx`:

```bash
npx -y @rarefriend-ai/mcp
```

## Get credentials

Go to **Rarefriend → Settings → Integrations → MCP / AI Agent**, click **Manage → Generate OAuth Client**. Copy the client ID and secret (shown once).

## Configure your client

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "rarefriend": {
      "command": "npx",
      "args": ["-y", "@rarefriend-ai/mcp"],
      "env": {
        "RAREFRIEND_CLIENT_ID": "your-client-id",
        "RAREFRIEND_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Cursor

Edit `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "rarefriend": {
      "command": "npx",
      "args": ["-y", "@rarefriend-ai/mcp"],
      "env": {
        "RAREFRIEND_CLIENT_ID": "your-client-id",
        "RAREFRIEND_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add rarefriend npx -- -y @rarefriend-ai/mcp \
  -e RAREFRIEND_CLIENT_ID=your-client-id \
  -e RAREFRIEND_CLIENT_SECRET=your-client-secret
```

## Environment variables

| Variable                   | Required | Description                                  |
| -------------------------- | -------- | -------------------------------------------- |
| `RAREFRIEND_CLIENT_ID`     | yes      | OAuth client ID from Rarefriend settings     |
| `RAREFRIEND_CLIENT_SECRET` | yes      | OAuth client secret from Rarefriend settings |

## How it works

1. On start, requests an OAuth access token via `client_credentials` grant at `/api/auth/oauth2/token` with RFC 8707 `resource` indicator.
2. Connects to the remote HTTP MCP server at `/api/mcp` with the token as a Bearer header.
3. Spawns a local stdio MCP server that proxies `tools/list` and `tools/call` to the remote server.
4. Refreshes the token automatically 60 seconds before expiry (reconnects the remote transport with the fresh token).

## Security

- Credentials are read from environment variables only. Never stored in files.
- Tokens are held in process memory only and expire on process exit.
- Scoped to `workspace:read` by default; write scopes are enabled server-side based on the client's configured permissions.
- No outbound network calls beyond `https://rarefriend.com`.

## License

MIT
