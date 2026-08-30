# P3 — Data migration pipeline

Status: implemented — real-dump rehearsal pending (wizard run)
Source: [Implementation phasing § P3](../colist-v2-rebuild/issues/18-implementation-phasing.md) + tickets [11 migration/cutover](../colist-v2-rebuild/issues/11-data-migration-cutover.md), [10 domain model](../colist-v2-rebuild/issues/10-domain-model-v2.md); transform gotchas from the [P2 spec comment](../colist-v2-p2-api/spec.md).
Branch: `feat/p3-migration` (off `feat/p2-api`; PR #4 ← PR #1 ← PR #2 ← `dev` still unmerged — retarget when the stack lands). `main` untouched.
Base: P2 schema `apps/api/migrations/0000_init.sql` (better-auth 1.7 tables, uuid ids); local docker Postgres 17 on `:5200` (`bun run start:services`); the API applies migrations on boot.

## Scope

One wizard, `scripts/migrate-legacy.sh` (`/wizard` template, committed — runs twice: local rehearsal now, prod at P5 through `scripts/db-tunnel.sh`), plus three SQL files in `scripts/migrate-legacy/`. Working files under `.migration/` (gitignored).

### 1. Export (HITL: connection string)
- Supabase project `zgyllhgyslhshfbfujfu` is live. Dashboard → Connect → **Session pooler** URI (direct is IPv6-only; WSL has none) → `SUPABASE_DB_URL` in `.env.migration.local`.
- `psql \copy (SELECT …) TO '.migration/<table>.csv' CSV HEADER` per table: `auth.users` (id, email, encrypted_password, created_at, updated_at) + `public.{profiles,lists,members,categories,items,errors,feedbacks}`. **Deviation from ticket 11's `pg_dump --data-only`**: local `pg_dump` is 14 (server is newer) and a data-only dump of `auth.users` drags every Supabase column along; `\copy` needs only the psql client and picks columns.
- Avatars: bucket `profiles` is public — `curl https://<ref>.supabase.co/storage/v1/object/public/profiles/<userId>/<picture>` for every `profiles.picture IS NOT NULL` → `.migration/avatars/<userId>/<picture>`. No storage API key, no bun script.

### 2. Load — `legacy.sql` + `transform.sql` + `verify.sql`
- `legacy.sql`: `DROP SCHEMA legacy CASCADE; CREATE` — minimal tables with the legacy column names (quoted camelCase), no FKs; `\copy … FROM csv`.
- `transform.sql` (one transaction, idempotent — `TRUNCATE "user", lists, errors, feedbacks CASCADE` first, which also resets every session per ticket 11):
  - seeded `tester-1/2@gmail.com` dropped before anything (ticket 10: never again); lists left without members are dropped after memberships load.
  - `profiles` → `user`: id kept, `name = coalesce(nullif(name,''), local-part)`, `email_verified = true`, `image = <avatar_base>/<id>/<picture>`, `created_at = updated_at = created`. `avatar_base` = psql var, default `https://colist-production-uploads.s3.us-east-2.amazonaws.com/avatars` (P2 note: public URL, not bare key).
  - `auth.users` → `account`: `issuer = 'local:credential'`, `provider_id = 'credential'`, `account_id = user id`, `password = encrypted_password` (bcrypt `$2…`, `verifyAnyPassword` accepts it); rows with empty hash skipped (Google-only users re-link on first Google login).
  - `lists`/`categories`/`items` 1:1 with `OVERRIDING SYSTEM VALUE` (PKs are `GENERATED ALWAYS`); `items.client_id = NULL`.
  - `members` → `memberships`, `created_at = now()`; `role::text::membership_role`.
  - `errors`/`feedbacks`: `message` jsonb (Tiptap doc) → text via `jsonb_path_query(message, '$.**.text')` joined by spaces, fallback to the scalar string; `files` `coalesce('{}')`; `user_id` only when the profile survived.
  - `activities` empty; `setval` on lists/categories/items/errors/feedbacks sequences to `max(id)`.
- `verify.sql`: `DO … ASSERT` row counts legacy vs v2 (users, accounts, lists, memberships, categories, items, errors, feedbacks), every `user.image` resolves to a downloaded file name that is URL-safe (`[A-Za-z0-9._-]`), sequences past max id. This is the one runnable check.

### 3. Wizard stages
1. Supabase URI (`ask_secret`, tested with `select 1`).
2. Export CSVs (row counts printed).
3. Download avatars.
4. Target `DATABASE_URL` (default = `apps/api/.env.development.local`; prod = tunnel `localhost:5432?sslmode=require`), checks the `user` table exists (else "boot the API once"), **`confirm` before TRUNCATE**.
5. Load: legacy → transform → verify.
6. Avatars → S3 (`aws s3 sync … s3://colist-production-uploads/avatars/`, `confirm`-gated; skipped locally until the bucket exists at P5).
7. Smoke: user boots `bun run dev`, wizard signs in with the user's real email/password via `POST /api/auth/sign-in/email` and prints `GET /api/lists`.

### 4. Fix found on the way
`feat/p2-api` API doesn't boot in dev: nestjs-zod 5.5 calls `toJSONSchema` without `unrepresentable`, so `z.date()` in response schemas throws (`Date cannot be represented in JSON Schema`) at `DocsSetup`. Tests passed because they don't build the doc. Fix: `common/domain/date-time.schema.ts` (`z.date().transform(toISOString).pipe(z.iso.datetime())`), domain types switch to `z.input`. Wire format unchanged.

## Out of scope
Prod run (P5 step 3 — same wizard, different target), avatar renaming/re-keying, legacy `files` attachment keys (kept verbatim, dead references), `pg_dump` full backup (Supabase stays up 30 days post-cutover), deleting the transform (P5 step 5).

## Done
- Wizard run end to end against the real dump into local docker Postgres; `verify.sql` passes.
- Sign in locally with real password → own lists returned (`user.image` carries the final S3 URL; renders once P5 uploads).
- `bun run lint && bun run test` green (root `lint:spell` on untracked `scripts/migrate-*.sh` ignored).
- PR `feat/p3-migration` → `feat/p2-api` stacked on #4.

## Comments

- 2026-08-30: pipeline implemented on `feat/p3-migration`. Synthetic rehearsal (fake CSVs with a real bcrypt hash, valid v4 uuids, Tiptap jsonb, tester accounts, orphan list) runs green through legacy → transform → verify, API boots on the result, `POST /api/auth/sign-in/email` with the bcrypt password → 200, `GET /api/lists` / `/api/me` / items correct, `user.image` = S3 public URL. Deviations from ticket 11: `\copy` per table instead of `pg_dump --data-only` (pg_dump 14 vs newer server, and `auth.users` column drift); curl over the public `profiles` bucket instead of a bun download script; `jsonb_path_query('strict $.**.text')` for the Tiptap flatten (lax mode double-counts). Found and fixed a P2 boot bug on the way (§4). **Pending, human-only**: `scripts/migrate-legacy.sh` against the real Supabase dump into local docker Postgres (stages 1–7, skip stage 6 until P5) — that run closes the phase and turns the local DB into the dev dataset.
