# Implementation phasing

Type: grilling
Status: resolved
Blocked by: 08, 09, 10, 11, 12, 13, 14, 15, 16, 17

## Question

Slice the rebuild into ordered implementation phases, each handable to `/implement` in one effort: monorepo scaffold, API build-out, client build-out, feature-parity checklist, cutover order. Terminal ticket — the map is done when this resolves. Graduated from fog once platform (05), API (06), and DB (07) locked; blocked on every remaining decision.

## Answer

Grilled 2026-08-30, three rounds. Six phases, seven `/implement` efforts. Everything lands on `dev` via one PR per phase (`feat/p<N>-<slug>` → `dev`); the first `main` merge is P5's deploy. Handoff: when a phase is picked up, create `.scratch/colist-v2-p<N>-<slug>/spec.md` from that phase's section below + linked tickets (tracker: one feature per dir). Parity inventory: [`research/feature-parity-checklist.md`](../research/feature-parity-checklist.md).

### Ordering constraints
- **`main` frozen** until the wizard step "tag `legacy` + Vercel Settings → Git → Disconnect" runs (P5). Branch guard from ticket 14 enforces it.
- **Wizard `scripts/setup-aws-prod.sh` runs in two sittings**: through `aws sso login` → `colist-tfstate` → bootstrap apply (free; needed for `iac.yml` plan role) at P1, stop marker; resume at P5 (`production` init/import/apply → tunnel → SSM secrets → `legacy` tag + Vercel disconnect → `AWS_ACCOUNT_ID`). Avoids paying idle EC2+RDS for months.
- Migration pipeline (P3) precedes web (P4) — ticket 17 has no seeds; local dev data *is* the rehearsed prod dump.

### P0 — Monorepo scaffold (tickets 14, 15, 13-partial)
- **Delete the Next.js app on `dev`** (all of `app/`, `deprecated/`, `lib/`, `supabase/`, Next config). Frozen copy = `main` / `legacy` tag. Red `check-types` on `dev` becomes moot.
- Root: mise + `mise.lock`, turbo, prettier, cspell, knip, syncpack, eslint flat `strictTypeChecked`, branch guard pre-commit (`main` only), CONTRIBUTING script grammar, `.env.example`, `docker-compose.yml` (Postgres 17).
- `apps/api`: NestJS 11 + Express 5 skeleton, `project-structure.mjs`, Drizzle + on-boot `migrate()`, `DATABASE_URL` only, pino, `/health`, Dockerfile (vav installer stage).
- `apps/web`: Vite + TanStack Router + Mantine + Tailwind 4 bare hello, i18next wired (pt/en/es, one string, typed resources), vite-plugin-pwa with manifest + icon set carried over from `public/`, FSD + steiger, Dockerfile (builder → `caddy:2-alpine` + Caddyfile), `VITE_APP_VERSION` build-arg.
- `.github/workflows/test.yml` (vav verbatim).
- **Done**: `bun run check` green, both images build locally.

### P1 — Infra & CI code (tickets 12, 13)
- `iac/{bootstrap,environments/production,modules}` per ticket 12 (private RDS, task role, uploads bucket, zone import, EIP A record).
- `.github/`: `main.yml` (apply ‖ build-api ‖ build-web → deploy, `workflow_dispatch` rollback), `iac.yml` (PR plan), `scripts/deploy-ecs.sh` (two images), `dependabot.yml` (vav minus uv, `target-branch: dev`).
- Wizard `scripts/setup-aws-prod.sh` authored in full; **run through bootstrap only**. `scripts/db-tunnel.sh`.
- **Done**: `iac.yml` plan green on the PR; bootstrap applied; `test.yml` gating.

### P2 — API (tickets 08, 10, 17, 09, 16, 06)
- better-auth mounted (email/password + Google, cookie sessions in PG, bcrypt-compatible `password.verify`), `@Auth`/`@ActiveUser` guards, TokenValidator port.
- Drizzle schema from ticket 10 (ICU collation, composite FK, `activities`), first migration.
- Endpoints: lists CRUD + leave (auto-promote), memberships (add by email w/ profile lookup, remove), categories CRUD, items CRUD + check + search/sort/group params, activities read, `GET /events` SSE (EventEmitter2), `POST /errors` (public, throttled) + `POST /feedbacks`, presigned PUT for avatars/attachments, `PATCH /me` (name, image).
- nestjs-zod + OpenAPI spec emitted for orval.
- Tests per ticket 17: own-your-data e2e per endpoint with member/owner/non-member matrix, throttle + SSE specs boot own app, globalSetup runs `migrate()`.
- **Done**: e2e matrix green in `test.yml`.

### P3 — Data migration pipeline (ticket 11)
- `pg_dump --data-only` export (auth.users + public.*), bun avatar download script, `legacy` schema load, one-shot transform SQL (users→user/account, members→memberships, 1:1 lists/categories/items, jsonb→text, avatars→S3 keys, `setval`).
- Local rehearsal into docker Postgres; resulting DB = local dev data from here on.
- **Done**: log in locally with real password, see own lists, avatar renders.

### P4a — Web client, online parity (tickets 05, 15, 09-partial, 16-partial)
- orval client from P2 spec; TanStack Query; auth screens (sign-in/up sliding panels, password-strength popover, Google button, language picker, theme toggle); AppShell (header + tabs, hover-expanding desktop navbar, mobile footer); lists (create/rename/delete owner-only/leave, tabs, persisted selection, unchecked badge, slide animation, empty states); members (avatar group, modal, add-by-email w/ preview, remove); items (form drawer, amount modal, details, check, delete, completed accordion, row enter/exit animation, search affix w/ highlight, sort name/`updated_at`, group by category, persisted options, skeletons/empty states); categories (picker, inline create, rename, delete); history drawer (Activities, per-action i18n keys); feedback/error forms (plain textarea, stars, attachments via presigned PUT); profile (name + avatar file input, light/dark, primary color); global mutation/query toasts, delete-confirm modal, QueryBoundary; SSE invalidation.
- **Dropped from gate**: "Alpha" badge/version label, `/test` page, NPS form, Tiptap, Uppy/TUS, dayjs, email confirmation/reset, "remember me". Everything else in the inventory is required, animations included.
- **Done**: inventory ticked against P3 local data.

### P4b — Web client, offline & crash capture (tickets 09, 16)
- `persistQueryClient` (IDB) + app-shell SW + `/~offline` fallback (translated); paused-mutation queue for item/category ops with client UUIDs; list/membership ops fail fast offline; blanket invalidate on reconnect/focus; crash auto-capture → `POST /errors` with `VITE_APP_VERSION`, dedup guard.
- **Done**: airplane-mode add/check/edit survives reload and syncs on reconnect; a thrown error lands in `errors`.

### P5 — Deploy & cutover (tickets 12, 13, 11, 19, 20)
1. Resume wizard: production apply (zone import), session-manager-plugin, tunnel, RDS secret → SSM params (+ Google prod creds), `legacy` tag, Vercel disconnect, `AWS_ACCOUNT_ID`.
2. PR `dev` → `main`: `main.yml` builds + deploys; smoke `https://colist.heloineto.com/health`, sign-up, SSE, Google login (consent still Testing).
3. WhatsApp freeze; export → transform → load via tunnel; avatars → S3; all sessions reset.
4. 1-week soak. 5. Supabase paused (deleted +30 d), Vercel project deleted, transform script deleted, Google consent → production.
- **Done**: soak complete, Supabase paused.

### Rejected
Merging P1 into P0 or P3 into P2; keeping the Next app in `legacy/`; running the full wizard at P1 (idle cost) or at P5 only (red `iac.yml`); MVP-subset parity; a single web effort; `legacy`/Vercel disconnect before P5.
