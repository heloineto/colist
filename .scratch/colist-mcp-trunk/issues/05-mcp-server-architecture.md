# MCP server architecture

Type: grilling
Status: resolved
Blocked by: 03, 04

## Question

Where does the MCP server live and how is it wired: separate service vs a new context inside apps/api, SDK choice, endpoint path, stateless vs sessionful transport, how Caddy routes it and the OAuth well-known endpoints, how auth plugs into the existing TokenValidator/guards, and how tools reach use-cases while keeping hexagonal boundaries and membership authz?

## Answer

Decided AFK 2026-11-15, from [Research remote MCP servers for Claude connectors](03-research-remote-mcp-claude-connectors.md) + [Research better-auth as MCP authorization server and NestJS MCP libraries](04-research-better-auth-oauth-and-nest-mcp.md).

**Where:** inside `apps/api`, new presentation-only context `src/mcp/` (like `health`). Same container, same deploy, same domain. No new service, no Terraform change.

**Endpoint:** `https://colist.heloineto.com/api/mcp` = the OAuth `resource`. One `@Public()` `McpController` (`@All('mcp')`) so the global `SessionGuard` doesn't answer 401 first. Local dev resource derived from `BETTER_AUTH_URL`.

**SDK:** MCP TypeScript SDK v2: `@modelcontextprotocol/server` `createMcpHandler` (stateless, **default legacy mode** so 2025-protocol clients still work) + `@modelcontextprotocol/node` `toNodeHandler`, fed the already-parsed `req.body` (app-level `useBodyParser('json')`). `@rekog/mcp-nest` rejected (needs `@nestjs/microservices` + its own auth).

**Auth (API side):** better-auth bumped `1.7.2 → 1.7.25`; add `jwt()` + `mcp({ resource, loginPage: '/auth', consentPage: '/oauth/consent' })` + `cimd()`. Handler wrapped in `requireMcpAuth(auth, handler, { resource })` from `@better-auth/mcp`: in-process JWT check (sig, iss, aud, exp), Claude-compatible 401 + `WWW-Authenticate: Bearer resource_metadata=...`. `claims.sub` → existing lookup-user use-case → `ActiveUser` (name needed for Activities). `TokenValidator`/`SessionGuard` untouched: bearer auth exists only at this edge. DB: 8 tables (oauth client/consent/tokens + `jwks`) generated with `auth generate`, merged into the iam drizzle schema, shipped as a normal migration (on-boot `migrate()`).

**Routing:** `app.use('/.well-known', toNodeHandler(auth))` in the API; Caddy gets one extra `handle /.well-known/oauth-* /.well-known/openid-configuration*` block → `localhost:5100` (today everything outside `/api/*` falls to the SPA).

**Hexagonal + authz:** tools call existing use-cases (Activities + SSE come for free, they live in use-cases). Membership authz today lives only in `MembershipGuard` (presentation), which tools bypass, so extract its check into `list/application` as `AuthorizeMembershipUseCase(userId, listId, role?)`; `MembershipGuard` delegates to it and every list-scoped tool calls it first. One source of truth, 404 for non-members kept.

**Errors:** use-case/HTTP exceptions → tool result `isError: true` with the message (not JSON-RPC errors), so Claude can recover.

**Origin check** on the MCP route (SDK option) against DNS-rebinding; DPoP off (breaks behind Caddy, Claude doesn't use it).
