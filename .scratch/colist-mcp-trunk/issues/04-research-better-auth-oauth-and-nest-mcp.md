# Research better-auth as MCP authorization server and NestJS MCP libraries

Type: research
Status: resolved
Blocked by: 

## Question

Can better-auth (repo is on ^1.7.2) act as the OAuth 2.1 authorization server for an MCP server: the mcp plugin vs the oauth-provider plugin (status, deprecation, DCR/CIMD, consent/login page hooks, token validation helpers, DB tables)? And how to host an MCP Streamable HTTP endpoint inside NestJS 11 + Express 5: raw @modelcontextprotocol/sdk vs @rekog/mcp-nest (maturity, stateless mode, auth integration). Output: research/better-auth-oauth-and-nest-mcp.md.

## Answer

Findings: [research/better-auth-oauth-and-nest-mcp.md](../research/better-auth-oauth-and-nest-mcp.md). Gist: old core `mcp`/`oidcProvider` removed in better-auth 1.7.0; use `@better-auth/mcp` (`oauthProvider` preset) + `@better-auth/cimd` + `jwt()`, all 1.7.25 in lockstep (repo must bump from 1.7.2). CIMD default, DCR opt-in, PKCE S256, `resource`-bound JWT access tokens (1h default, not revocable), rotating refresh tokens. Login/consent redirect to SPA pages with a signed query; `oauthProviderClient()` resumes. Well-known docs served by plugin hooks via `app.use('/.well-known', toNodeHandler(auth))`. `requireMcpAuth` validates in-process and emits the Claude-friendly 401. 8 new tables. Revoke = delete consent **and** refresh tokens. MCP SDK v2 (`@modelcontextprotocol/server` + `/node`) `createMcpHandler` stateless; skip `@rekog/mcp-nest`. Keep SDK legacy mode (do not `reject` 2025 clients).
