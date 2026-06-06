#!/usr/bin/env node
/**
 * @rarefriend/mcp — stdio proxy for Rarefriend CRM
 *
 * Bridges any stdio MCP client (Claude Desktop, Cursor, Claude Code CLI, etc.)
 * to the Rarefriend HTTP MCP server using OAuth client_credentials.
 * Tokens are refreshed automatically — no browser needed.
 *
 * Usage:
 *   npx -y @rarefriend/mcp
 *
 * Environment variables (required):
 *   RAREFRIEND_CLIENT_ID      — OAuth client ID from Rarefriend settings
 *   RAREFRIEND_CLIENT_SECRET  — OAuth client secret from Rarefriend settings
 *
 * Claude Desktop config (~/.config/Claude/claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "rarefriend": {
 *         "command": "npx",
 *         "args": ["-y", "@rarefriend/mcp"],
 *         "env": {
 *           "RAREFRIEND_CLIENT_ID": "your-client-id",
 *           "RAREFRIEND_CLIENT_SECRET": "your-client-secret"
 *         }
 *       }
 *     }
 *   }
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';

const SERVER_URL = 'https://rarefriend.com';

const CLIENT_ID = process.env.RAREFRIEND_CLIENT_ID;
const CLIENT_SECRET = process.env.RAREFRIEND_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  process.stderr.write(
    '[rarefriend-mcp] Error: RAREFRIEND_CLIENT_ID and RAREFRIEND_CLIENT_SECRET are required.\n' +
      'Get your credentials from Rarefriend Settings → Integrations → AI Agent Integration.\n'
  );
  process.exit(1);
}

// ── Token management ──────────────────────────────────────────────────────────

interface OAuthToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let cachedToken: OAuthToken | null = null;

async function getToken(): Promise<string> {
  const SKEW_MS = 60_000; // refresh 60 s before expiry

  if (cachedToken && Date.now() < cachedToken.expiresAt - SKEW_MS) {
    return cachedToken.accessToken;
  }

  const response = await fetch(`${SERVER_URL}/api/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: 'workspace:read',
      // RFC 8707 resource indicator — sets the aud claim on the issued token
      resource: `${SERVER_URL}/api/mcp`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Token request failed (${response.status}): ${body}\n` +
        'Check your RAREFRIEND_CLIENT_ID and RAREFRIEND_CLIENT_SECRET.'
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in?: number;
  };

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return cachedToken.accessToken;
}

// ── Remote MCP client ─────────────────────────────────────────────────────────

async function createRemoteClient(): Promise<Client> {
  const token = await getToken();

  const client = new Client({ name: 'rarefriend-proxy', version: '1.0.0' }, { capabilities: {} });

  const transport = new StreamableHTTPClientTransport(new URL(`${SERVER_URL}/api/mcp`), {
    requestInit: {
      headers: { Authorization: `Bearer ${token}` },
    },
  });

  await client.connect(transport);
  return client;
}

// ── Stdio proxy server ────────────────────────────────────────────────────────

async function main() {
  let remote: Client;

  try {
    remote = await createRemoteClient();
  } catch (err) {
    process.stderr.write(`[rarefriend-mcp] Failed to connect: ${err}\n`);
    process.exit(1);
  }

  const server = new Server(
    { name: 'rarefriend-crm', version: '1.0.0' },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ── Helper: reconnect if the cached token has expired ─────────────────────
  // The transport holds the token set at connect time. When the token nears
  // expiry we reconnect so subsequent calls carry a fresh bearer token.
  async function ensureFreshClient(): Promise<Client> {
    const SKEW_MS = 60_000;
    if (cachedToken && Date.now() < cachedToken.expiresAt - SKEW_MS) {
      return remote;
    }
    // Token stale — reconnect with a fresh one
    try {
      const fresh = await createRemoteClient();
      remote = fresh;
    } catch (err) {
      process.stderr.write(`[rarefriend-mcp] Token refresh/reconnect failed: ${err}\n`);
      // Return existing client; the call may fail but at least we tried
    }
    return remote;
  }

  // Proxy: tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const client = await ensureFreshClient();
    return client.listTools();
  });

  // Proxy: tools/call — token checked on every call to handle long sessions
  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    const client = await ensureFreshClient();
    return client.callTool(request.params);
  });

  // Connect stdio
  const stdio = new StdioServerTransport();
  await server.connect(stdio);

  process.stderr.write(`[rarefriend-mcp] Connected to ${SERVER_URL}/api/mcp\n`);
}

main().catch((err) => {
  process.stderr.write(`[rarefriend-mcp] Fatal: ${err}\n`);
  process.exit(1);
});
