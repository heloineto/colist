---
title: Colist v2 Rebuild
labels: [wayfinder:map]
---

# Colist v2 Rebuild — Wayfinder Map

Tracker: local markdown. Tickets live in `.wayfinder/tickets/NNN-slug.md`; a ticket is claimed when `assignee` is set, closed when `status: closed`. `blocked-by` lists ticket file slugs; frontier = open + unassigned + all blockers closed. Research findings land in `.wayfinder/research/`.

## Destination

Colist rebuilt as a voto-a-voto-style monorepo: bun + turborepo + mise, its own API and Postgres, zero Supabase, mobile-first client on the platform this map decides, deployed to AWS via Terraform + GitHub-OIDC CI/CD. The map is done when every architectural decision is locked and implementation is ready to hand off (per phase, to `/implement`).

## Notes

- Reference repo: `/home/heloi/programming/voto-a-voto` — the base for tooling, conventions, API architecture, iac, CI/CD. Explored 2026-08-16; summaries in ticket bodies.
- Colist today: Next.js PWA shopping-list app (pt-BR default, en/es), Supabase for auth/db/realtime/storage, deployed by Vercel git integration. Alpha, mid-internal-migration (`deprecated/` still powers most of the app).
- **Never commit to `main`** — Vercel auto-deploys it. Work on `dev` / feature branches.
- Skills for tickets: `/grilling` + `/domain-modeling` (grilling tickets), `/prototype`, `/research`.
- User must run `/setup-matt-pocock-skills` themselves (model-blocked) — see the setup ticket.
- User stack affinity (from both repos): bun, turbo, Mantine + Tailwind 4, TanStack Query, zod 4, react-hook-form, Phosphor icons, conventional commits.

## Decisions so far

<!-- one line per closed ticket -->

## Not yet specified

- Implementation phasing: monorepo scaffold, API build-out, client build-out, feature-parity checklist, cutover order — can't slice until platform/API/DB decisions land.
- Observability: PostHog (planned in old code, never installed), Sentry, structured logging — after API stack decision.
- Push notifications (natural for a shared list; only feasible-by-default if native) — after platform decision.
- i18n mechanism in the new client (current: inline `t({pt,en,es})` objects) — after platform decision.
- Distribution: app stores vs PWA install, versioning/OTA updates — after platform decision.
- Fate of feedback/error-report features (Tiptap editor, `errors`/`feedbacks` tables) — after domain model v2.
- Landing page for colist.com.br (middleware has a stub for one that never existed).
- Seed + test strategy for the new API (vav has fishery/faker + e2e-against-real-PG worth copying).

## Out of scope

- Any changes to the voto-a-voto repo itself — it's a reference, not a work target.
- New product features beyond current parity (history feature and category-edit are existing half-finished work, so they're in scope as domain-model decisions).
