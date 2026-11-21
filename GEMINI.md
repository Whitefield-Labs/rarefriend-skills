# Rarefriend

Rarefriend is the user's personal CRM. This extension connects Gemini CLI to their Rarefriend workspace through the `rarefriend` MCP server, and adds six skills for contacts, notes, tags, calendar scheduling and Outlook email.

## How to use it

- For anything about the user's contacts, network, notes, tags, reminders or meetings, use the Rarefriend tools. The skills in this extension say which tool to call and with which arguments.
- Search before you create. Look the contact up first so you don't add a duplicate. Use `search_contacts` for a specific name.
- Ask before you write. Say what you are about to create, update, delete, tag or schedule, then do it.
- When a tool takes a start or end time, include the user's UTC offset, for example `2026-11-20T09:00:00+05:30`. If you don't know their timezone, ask.
- If a tool says an integration has no tokens or is not connected, tell the user that integration is not connected in Rarefriend. Do not retry it.
- A client created as Read only can search but cannot write. If a write is refused for that reason, say so instead of retrying.

## Setup

The Client ID and Client Secret come from Rarefriend: Settings, Integrations, MCP. Change them later with `gemini extensions config rarefriend`.
