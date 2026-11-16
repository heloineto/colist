# MCP authorization UX and token policy

Type: grilling
Status: resolved
Blocked by: 04, 05

## Question

What does the user see when connecting Claude: login page reuse, consent screen in the SPA, scopes, client registration mode, token lifetimes/refresh, and how a user revokes Claude's access?

## Answer

Decided AFK 2026-11-15.

**Client registration:** CIMD only (`cimd()` advertises `client_id_metadata_document_supported` + `none`, so claude.ai and Claude Code both pick it). DCR off; enabling it is a documented one-line fallback if some client fails. No pre-registered clients.

**Flow the user sees:** claude.ai Settings → Connectors → Add custom connector → paste `https://colist.heloineto.com/api/mcp` → browser opens Colist:
1. **Login:** existing `/auth` page (email+password or Google). `authClient` gets `oauthProviderClient()` so sign-in resumes the OAuth flow; the post-sign-in `navigate('/app')` is skipped when the URL carries `sig` (race found in research).
2. **Consent:** new SPA route `/oauth/consent` (session required, query string preserved): client name/logo from its metadata document, redirect host, one plain line of what it can do ("Ver e editar suas listas"), Allow / Deny → `authClient.oauth2.consent`. Consent is remembered, reconnects skip it. Copy in pt/en/es.

**Scopes:** one resource scope `lists` ("read and edit your lists") + `offline_access` (Claude adds it). No read-only split: one grant covers all 8 tools; Claude's own per-tool prompts (destructiveHint) are the fine-grained control.

**Tokens:** access JWT **15 min** (bounds revocation lag, JWTs aren't revocable), refresh **30 days**, rotating (defaults). Claude refreshes on its own.

**Revocation:** new "Apps conectados" section on the profile page: lists the user's consents (`getOAuthConsents`), "Desconectar" button → new API endpoint that deletes the consent **and** that user's refresh tokens for the client (consent delete alone lets refresh keep working). Access dies within 15 min. Removing the connector in claude.ai also works from Claude's side.

**Domain term:** "Connected app" added to `CONTEXT.md`.
