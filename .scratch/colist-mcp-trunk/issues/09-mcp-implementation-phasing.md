# Implementation phasing and handoff

Type: grilling
Status: resolved
Blocked by: 01, 02, 05, 06, 07, 08

## Question

In what order and in which PRs/efforts do the three changes ship, what does each /implement spec need, and how is the MCP server verified end to end (tests + a real claude.ai connection)?

## Answer

Decided AFK 2026-11-15. Two efforts, three PRs, all branched from and merged into `main`:

1. **PR `chore/trunk-based`** ([Retire the dev branch](01-retire-dev-branch.md) + [Dependabot six-month cadence](02-dependabot-six-month-cadence.md)). Small, no `/implement` spec needed. Then the manual follow-ups: close the 11 `dev` Dependabot PRs, delete `dev`, enable delete-branch-on-merge, alerts + security updates, manual "Check for updates". Goes first so the MCP PRs already follow trunk-based.
2. **Effort `colist-mcp`** (`/implement`, `spec.md` built from tickets 05-08):
   - **PR `feat/mcp-oauth`**: better-auth 1.7.25 + `jwt`/`mcp`/`cimd`, 8-table migration, `/.well-known` mount, Caddy route, SPA `/oauth/consent` + login resume + "Apps conectados" + disconnect endpoint, i18n. Deployable alone (metadata endpoints are harmless). Verify: PRM + AS metadata via curl on prod; full OAuth dance with MCP Inspector against local.
   - **PR `feat/mcp-server`**: SDK v2 controller, `AuthorizeMembershipUseCase` extraction (guard delegates), 8 tools, logging.

**Tests (vav harness, ticket 17 style):** unit tests per tool with an injected `ActiveUser` (no OAuth), owner/member/non-member matrix on each list-scoped tool; e2e: `/api/mcp` without token → 401 with `resource_metadata`, PRM/AS metadata shape, one happy path through the SDK client with a token minted from the test auth instance. Existing `MembershipGuard` e2e must stay green after the extraction.

**Real-world check (after deploy):** claude.ai → add custom connector `https://colist.heloineto.com/api/mcp` → sign in + consent → script: list lists, add 3 items, mark one bought, put it back, delete one (Claude must prompt), watch the web app update live; open the claude.ai mobile app and repeat one call; Claude Code `claude mcp add --transport http colist https://colist.heloineto.com/api/mcp` + `/mcp` login; finally "Desconectar" in Apps conectados and confirm Claude is asked to re-auth within 15 min.
