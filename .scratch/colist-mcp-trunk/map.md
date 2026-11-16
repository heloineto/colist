# Colist MCP + trunk-based: Wayfinder Map

Effort: `colist-mcp-trunk`. Tracker conventions: `docs/agents/issue-tracker.md` (local markdown). Research findings live in `research/`.

## Destination

Every decision locked, ready to hand to `/implement`, for three changes: (1) `dev` retired, trunk-based on `main` (feature branch → PR → `main` = deploy); (2) Dependabot runs every 6 months; (3) a remote MCP server for Colist that Claude (claude.ai, mobile, Claude Code) connects to as a custom connector to read and change the user's lists, items and categories.

## Notes

- **User directive (2026-11-15):** no grilling. The agent researches and decides every ticket itself (AFK, even grilling-type), then presents all decisions in one `/create-html` page for the user to override.
- Colist today: NestJS 11 API (hexagonal contexts, better-auth cookie sessions, `TokenValidator` port) + Vite SPA behind Caddy at `https://colist.heloineto.com`; `/api/*` → API, everything else → SPA. ~47 users.
- Keep hexagonal ports/use-cases (memory `hexagonal-arch-kept`). Activities + SSE invalidation are emitted inside use-cases via `ActivityRecorder`; list membership authz lives in presentation guards (`MembershipGuard`, `@ListRole`).
- `dev` and `main` are identical as of 2026-11-15; 11 open Dependabot PRs target `dev`.
- Skills: `/research` (research tickets), `/domain-modeling` (CONTEXT.md terms), `ctx7` for library docs.

## Decisions so far

- [Retire the dev branch](issues/01-retire-dev-branch.md): trunk-based on `main`; one `chore/trunk-based` PR (workflows, dependabot target, branch-name regex, husky msg, CONTRIBUTING), then close dev Dependabot PRs, delete `dev`, manual Dependabot re-check; enable delete-branch-on-merge.
- [Dependabot six-month cadence](issues/02-dependabot-six-month-cadence.md): native `semiannually` (Jan 1 / Jul 1) on all 3 ecosystems; turn on alerts + security updates as the safety net; `@nestjs/*` and vitest lockstep groups.
- [Research remote MCP servers for Claude connectors](issues/03-research-remote-mcp-claude-connectors.md): spec 2026-07-28 stateless Streamable HTTP, serve 2025 fallback too; OAuth 2.1 + PKCE + `resource`, PRM well-known, CIMD preferred over DCR; callback `claude.ai/api/mcp/auth_callback`; annotate every tool.
- [MCP tool surface](issues/06-mcp-tool-surface.md): 8 annotated tools only (list_lists, get_list, create_list, rename_list, add_items, update_items, delete_items, create_category); bulk item ops; uncheck = put back; no list delete / members / resources / prompts.
- [Research better-auth as MCP authorization server and NestJS MCP libraries](issues/04-research-better-auth-oauth-and-nest-mcp.md): `@better-auth/mcp` + `cimd` + `jwt` at 1.7.25 (bump from 1.7.2); `requireMcpAuth`; SDK v2 `createMcpHandler` stateless; skip `@rekog/mcp-nest`.
- [MCP server architecture](issues/05-mcp-server-architecture.md): `src/mcp/` presentation context in the API, `@Public()` `/api/mcp`, SDK v2 legacy-compatible stateless, `requireMcpAuth` at the edge, Caddy `/.well-known/oauth-*` route, membership check extracted to `AuthorizeMembershipUseCase`.
- [MCP authorization UX and token policy](issues/07-mcp-auth-ux.md): CIMD only, reuse `/auth` + new `/oauth/consent`, single `lists` scope, 15 min access / 30 d refresh, "Apps conectados" with disconnect (consent + refresh tokens).
- [MCP side effects: activities, realtime, throttling](issues/08-mcp-side-effects.md): Activities + SSE for free via use-cases, no "via Claude" marker, no IP throttle (Claude IPs are shared), 50-entry bulk cap.
- [Implementation phasing and handoff](issues/09-mcp-implementation-phasing.md): PR `chore/trunk-based` first, then `/implement` effort `colist-mcp` as `feat/mcp-oauth` → `feat/mcp-server`; unit matrix + e2e auth; real claude.ai/mobile/Claude Code checklist.

**Map complete 2026-11-15.** User approved every decision ([decisions page](decisions.html)).

**Implementation (2026-11-15, merged + deployed):** [#42 chore/trunk-based](https://github.com/heloineto/colist/pull/42) (repo settings already applied: delete-branch-on-merge, vulnerability alerts, security updates); [#43 feat/mcp-oauth](https://github.com/heloineto/colist/pull/43) (drops `account.issuer` per better-auth 1.7.3+, `clientPrivileges: () => false`); [#44 feat/mcp-server](https://github.com/heloineto/colist/pull/44) stacked on #43 (`FindUserUseCase`, list/item/category/iam modules made `@Global()` for cross-context use-cases). Done: dev PRs closed, `dev` deleted, Dependabot re-ran on `main` by itself. Verified: claude.ai custom connector connects and works (user, 2026-11-15).

## Not yet specified


## Out of scope

- Submitting Colist to Anthropic's connector directory, and announcing the connector to other users: any user can already add it by URL; beyond this destination.
- MCP resources, prompts and MCP Apps (interactive UI in Claude): tools cover every ask, see [MCP tool surface](issues/06-mcp-tool-surface.md).
