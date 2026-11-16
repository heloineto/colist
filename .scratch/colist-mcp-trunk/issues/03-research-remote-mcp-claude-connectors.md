# Research remote MCP servers for Claude connectors

Type: research
Status: resolved
Blocked by: 

## Question

What does a remote MCP server need today to work as a custom connector in claude.ai (web + mobile) and Claude Code: transport (Streamable HTTP vs SSE), current spec version, OAuth 2.1 requirements (protected-resource metadata, DCR vs Client ID Metadata Documents, PKCE, audience/resource indicators), claude.ai callback URLs, tool annotations, and limits? Output: research/remote-mcp-claude-connectors.md.

## Answer

Findings: [research/remote-mcp-claude-connectors.md](../research/remote-mcp-claude-connectors.md). Gist: spec `2026-07-28` is stateless POST-only Streamable HTTP (HTTP+SSE deprecated) but Claude still speaks 2025 handshakes in places, so serve both (SDK v2 `createMcpHandler`). Auth = OAuth 2.1 + PKCE S256 + RFC 8707 `resource`, audience-checked tokens, real `401` + `WWW-Authenticate: Bearer resource_metadata=...`, PRM at `/.well-known/oauth-protected-resource/api/mcp`. CIMD preferred (DCR deprecated); claude.ai uses CIMD when AS metadata advertises it + `none` auth method. Callback `https://claude.ai/api/mcp/auth_callback`; Claude Code uses loopback. Connectors on all plans (Free = 1); added on web works on mobile. Tools need `title` + `readOnlyHint`/`destructiveHint`; ~150k char results, 240 s calls.
