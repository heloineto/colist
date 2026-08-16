# Colist v2 Rebuild — Wayfinder Map

Effort: `colist-v2-rebuild`. Tracker conventions: `docs/agents/issue-tracker.md` (local markdown — tickets in `issues/NN-<slug>.md`, `Type:`/`Status:`/`Blocked by:` lines; frontier = open + unblocked + unclaimed). Research findings live in `research/`.

## Destination

Colist rebuilt as a voto-a-voto-style monorepo: bun + turborepo + mise, its own API and Postgres, zero Supabase, mobile-first client on the platform this map decides, deployed to AWS via Terraform + GitHub-OIDC CI/CD. The map is done when every architectural decision is locked and implementation is ready to hand off (per phase, to `/implement`).

## Notes

- Reference repo: `/home/heloi/programming/voto-a-voto` — the base for tooling, conventions, API architecture, iac, CI/CD. Explored 2026-08-16; summaries in ticket bodies.
- Colist today: Next.js PWA shopping-list app (pt-BR default, en/es), Supabase for auth/db/realtime/storage, deployed by Vercel git integration. Alpha, mid-internal-migration (`deprecated/` still powers most of the app).
- **Never commit to `main`** — Vercel auto-deploys it. Work on `dev` / feature branches.
- Skills for tickets: `/grilling` + `/domain-modeling` (grilling tickets), `/prototype`, `/research`.
- User stack affinity (from both repos): bun, turbo, Mantine + Tailwind 4, TanStack Query, zod 4, react-hook-form, Phosphor icons, conventional commits.

## Decisions so far

- [Run /setup-matt-pocock-skills](issues/01-run-setup-matt-pocock-skills.md) — setup complete: local markdown tracker in `.scratch/<effort>/`, default triage labels, single-context domain docs; this effort migrated from the interim `.wayfinder/` layout.
- [Research mobile platform landscape (Expo/RN vs PWA)](issues/02-research-mobile-platform-landscape.md) — Expo SDK 57 + bun/turbo monorepo officially supported, but Mantine doesn't port (NativeWind replaces); PWA modernization ~2–4 wks vs Expo rewrite ~6–10 wks; lean: modern PWA + Android TWA, stay Expo-ready.
- [Research auth without Supabase](issues/03-research-auth-without-supabase.md) — shortlist collapsed to better-auth (Lucia dead, Auth.js merged into it); Cognito can't import password hashes; SES for email; Supabase bcrypt hashes are portable.
- [Research realtime + offline sync options](issues/04-research-realtime-offline-sync.md) — sync engines are overkill for 7 tables; TanStack Query persistence + mutation queue is the first-party offline path; SSE/WS through Caddy is zero-config; lean: no sync engine, Electric as future upgrade path.
- [Mobile platform decision](issues/05-mobile-platform-decision.md) — web PWA locked: Vite + TanStack Router SPA (Mantine + Tailwind 4 stay), static files via Caddy, monorepo kept Expo-ready; no push notifications ever; native app is a future effort with its own map.

## Not yet specified

- Implementation phasing: monorepo scaffold, API build-out, client build-out, feature-parity checklist, cutover order — can't slice until platform/API/DB decisions land.
- Observability: PostHog (planned in old code, never installed), Sentry, structured logging — after API stack decision.
- Fate of feedback/error-report features (Tiptap editor, `errors`/`feedbacks` tables) — after domain model v2.
- Landing page for colist.com.br (middleware has a stub for one that never existed).
- Seed + test strategy for the new API (vav has fishery/faker + e2e-against-real-PG worth copying).

## Out of scope

- Any changes to the voto-a-voto repo itself — it's a reference, not a work target.
- New product features beyond current parity (history feature and category-edit are existing half-finished work, so they're in scope as domain-model decisions).
- Push notifications — ruled out entirely during the [Mobile platform decision](issues/05-mobile-platform-decision.md); not deferred, won't do.
- App-store distribution — Play Store TWA is the first move when the app goes public (zero architectural prep needed); Apple App Store only via a future native-app effort with its own map. Per the [Mobile platform decision](issues/05-mobile-platform-decision.md).
