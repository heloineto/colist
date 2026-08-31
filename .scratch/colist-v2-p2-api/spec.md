# P2 — API

Status: done
Source: [Implementation phasing § P2](../colist-v2-rebuild/issues/18-implementation-phasing.md) + tickets [08 auth](../colist-v2-rebuild/issues/08-auth-architecture-decision.md), [10 domain model](../colist-v2-rebuild/issues/10-domain-model-v2.md), [17 test/seed](../colist-v2-rebuild/issues/17-api-test-seed-strategy.md), [09 realtime/offline](../colist-v2-rebuild/issues/09-realtime-offline-strategy.md), [16 observability](../colist-v2-rebuild/issues/16-observability-stack.md), [06 API stack](../colist-v2-rebuild/issues/06-api-stack-decision.md).
Branch: `feat/p2-api` (off `feat/p1-infra-ci`; PR #1 ← PR #2 ← `dev` still unmerged — retarget when the stack lands). `main` untouched.
Base: P0 `apps/api` skeleton (NestJS 11 + Express 5, Drizzle on-boot `migrate()`, pino, nestjs-zod, `/health`). vav = pattern reference only.

## Runtime contract (fixed by P1)
- Env: `MODE`, `PORT=5100`, `BETTER_AUTH_URL`, `UPLOADS_BUCKET` plain; `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` from SSM. `WEB_URL` becomes optional (CORS/trusted origin fallback = `BETTER_AUTH_URL`). `AWS_REGION` default `us-east-2`; local dev `AWS_PROFILE=voto-a-voto`.
- Caddy proxies `/api/*` **unstripped** → `app.setGlobalPrefix('api', { exclude: ['health'] })`. ECS healthcheck stays `/health`. Docs at `/api/docs`, spec at `/api/openapi/json`.
- Release image copies `migrations/` (P0 Dockerfile already does); `migrate()` resolves from `process.cwd()`.

## Scope

### 1. Schema (ticket 10) — one drizzle migration, hand-edited where drizzle can't express it
- better-auth tables `user`/`session`/`account`/`verification` with **uuid ids** (`advanced.database.generateId` → `crypto.randomUUID`), generated via `@better-auth/cli generate` then trimmed to our conventions (snake_case, `timestamptz`).
- `lists`, `memberships` (PK `(user_id, list_id)`, `role` enum `owner|member`), `categories` (`UNIQUE(id, list_id)`), `items` (composite FK `(category_id, list_id) → categories(id, list_id) ON DELETE SET NULL (category_id)` — PG15 column-subset form, **hand-written SQL**; `client_id uuid` nullable + `UNIQUE(list_id, client_id)` for idempotent offline creates — addition to ticket 10, driven by ticket 09 §7), `activities`, `feedbacks`, `errors`. Exactly the sketch in ticket 10 otherwise.
- `COLLATE "pt-BR-x-icu"` on every `name` column (hand SQL); `CREATE EXTENSION unaccent` for search.
- `created_at`/`updated_at` everywhere except `activities`; `updated_at` via drizzle `$onUpdate`.
- Schema files live per context in `src/<ctx>/infrastructure/persistence/drizzle/<ctx>.schema.ts` (drizzle.config already globs them); cross-context FK imports are allowed by the lint rules (`src/*/infrastructure/**`).

### 2. Auth (ticket 08) — context `iam`
- better-auth instance in `iam/infrastructure/better-auth/`: `drizzleAdapter(pg)`, `emailAndPassword` with custom `password.verify` accepting **bcrypt** (`bcryptjs`, for the Supabase import) and falling back to better-auth's scrypt for new hashes; `socialProviders.google`; `account.accountLinking.trustedProviders: ['google']`; cookie sessions in PG; `basePath: '/api/auth'`; `trustedOrigins` = `WEB_URL ?? BETTER_AUTH_URL`. No email verification, no reset, no 2FA.
- Mounted as an Express handler for `/api/auth/*` **before** Nest's body parser (`bodyParser: false` + manual `express.json()` after the mount, or `toNodeHandler` on the raw path — whichever the docs agent confirms).
- Course-style port: `AuthType { Session, None }`, `@Auth(AuthType.None)`, global `APP_GUARD` `AuthGuard` → `SessionGuard` (`TokenValidator` port; single adapter = `auth.api.getSession({ headers })`), `@ActiveUser()` reads `REQUEST_USER_KEY`. `ActiveUser = { id, email, name, image }`.
- Endpoints: `GET /me`, `PATCH /me { name?, image? }` (via `auth.api.updateUser`), `GET /users/lookup?email=` → `{ id, name, image } | 404` (the add-by-email preview; enumeration oracle accepted per ticket 10).
- Auth error-code → pt-BR table: **dropped** from the API — better-auth returns stable `code`s; the client maps them (client-side i18n, same as activities). Noted so P4a picks it up.

### 3. Lists + memberships — context `list`
- `GET /lists` (mine, with `role` + unchecked-count), `POST /lists { name }` (creator = owner), `PATCH /lists/:listId { name }` (member), `DELETE /lists/:listId` (owner), `POST /lists/:listId/leave` (member; owner leaving → promote longest-standing member by `memberships.created_at`; last member → delete list).
- `GET /lists/:listId/memberships`, `POST /lists/:listId/memberships { userId }` (owner), `DELETE /lists/:listId/memberships/:userId` (owner, not self).
- Authorization: `MembershipGuard` in `list/presentation/http/guards` resolves `:listId` + active user → membership row on the request (404 when none — non-members can't distinguish "no list" from "not yours"); `@ListRole(Role.Owner)` metadata for owner-only routes (403). Item/category/activity controllers reuse it.

### 4. Categories — context `category`
- `GET/POST /lists/:listId/categories`, `PATCH/DELETE /lists/:listId/categories/:id`. Delete → items' `category_id` nulled by the FK.

### 5. Items — context `item`
- `GET /lists/:listId/items?search=&sort=name|updatedAt&order=asc|desc&checked=` — search = `unaccent(name) ILIKE unaccent('%q%')`; `groupBy` is a client concern (rows carry `categoryId`), deviation from the "group param" wording.
- `POST /lists/:listId/items { clientId?, name, amount?, categoryId?, details? }` — `clientId` collision in the same list → 200 with the existing row (idempotent retry).
- `PATCH /lists/:listId/items/:id` (name/amount/categoryId/details/checked — checking bumps `updated_at`; `categoryId` from another list → 400 via FK failure mapped), `DELETE` → 204 also when already gone (tolerant no-op). PATCH on a missing item → 404; the client treats 404 as "gone, drop the queued op".

### 6. Activities — context `activity`
- `ActivityRecorder` application service: inserts the row (`actor_name`/`target_name` denormalized, server time) and emits `list.changed { listId, userIds }` on `EventEmitter2` (user ids = current members, computed before membership-removing ops so the removed user is notified). Every mutating use-case above calls it. Actions: `list.renamed`, `list.deleted` (emit only — row cascades), `item.created|updated|checked|unchecked|deleted`, `category.created|updated|deleted`, `member.added|removed|left`, `owner.promoted`.
- `GET /lists/:listId/activities?limit=&before=` (cursor by id, newest first).

### 7. Realtime (ticket 09) — context `realtime`
- `GET /events` `@Sse()`: session-cookie auth (default guard), rxjs `fromEvent(emitter, 'list.changed')` filtered by `userIds.includes(user.id)`, mapped to `{ type: 'list.changed', data: { listId } }`; `ping` comment every 25 s; `trust proxy` on. Stateless, no `Last-Event-ID`. `ponytail:` EventEmitter2 in-process; Postgres LISTEN/NOTIFY if instances multiply.

### 8. Reports (ticket 16) — context `report`
- `POST /errors` — `@Auth(AuthType.None)`, `@Throttle` per IP via `@nestjs/throttler` (global default generous; `/errors` = 10/min), body zod `{ message?, error?: { code?, name, message, stack, route, userAgent, appVersion }, allowCommunication?, files?: string[] }`; `user_id` from session when the cookie is present (guard runs `SessionGuard` opportunistically), else null. 201, no body.
- `POST /feedbacks { message, rating?, files? }` — authenticated. Insert-only, no reads.

### 9. Uploads (ticket 06/12) — context `upload`
- `POST /uploads/presign { kind: 'avatar' | 'attachment', contentType, fileName }` → `{ url, key }`; key = `avatars/<userId>/<uuid>.<ext>` or `attachments/<userId>/<uuid>.<ext>`; PUT presigned 5 min, `ContentType` pinned, 5 MB max (`ContentLength` isn't signable — enforce on bucket policy later; documented). Public avatar URL = `https://<bucket>.s3.<region>.amazonaws.com/<key>` returned alongside for `PATCH /me { image }`.
- Local dev: signing needs only credentials (`AWS_PROFILE`), not the bucket — PUT fails until P5; tests set static dummy `AWS_ACCESS_KEY_ID/SECRET` in `.env.test`.

### 10. Cross-cutting
- `ConfigSchema` gains `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `UPLOADS_BUCKET`, `AWS_REGION` (default), `WEB_URL` optional; `.env.example`/`.env.test` updated.
- OpenAPI: every controller `@ApiOperation({ operationId })` + `@ZodResponse` (orval input for P4a); better-auth routes are not in the spec (client uses `better-auth/react`); `@ApiCookieAuth()` on protected controllers.
- `PG` unique/FK violations → 409/400 through a small pg-error mapper in `common/presentation/http`.
- New deps: `better-auth`, `@better-auth/cli` (dev), `bcryptjs`, `@nestjs/event-emitter`, `@nestjs/throttler`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `fishery`, `@faker-js/faker`, `vitest-mock-extended` (dev). Caret ranges, no `latest`.
- `project-structure.mjs`: allow `src/*/test/*.mock.ts` imports from e2e (`test/**` is outside `src`, unaffected) and add `better-auth` schema file name if the generator's name doesn't match `*.schema.ts`.

### 11. Tests (ticket 17) — `/tdd` order: red e2e per endpoint → green
- `test/helpers/sign-up.ts`: `signUp(app, overrides?)` → `{ agent: supertest.agent with cookie, user }` via real `POST /api/auth/sign-up/email`; `userFactory` (fishery + faker, unique email).
- DTO factories in `src/<ctx>/test/<ctx>.mock.ts` (`createListDto`, `createItemDto`, `createCategoryDto`, `createFeedbackDto`, `createErrorReportDto`).
- One `test/<resource>.e2e-spec.ts` per resource, describe per route (vav convention doc ported to `docs/api/e2e-convention.md`), order auth → validation → happy → variants; **every list-scoped route asserts member / owner / non-member** (non-member = 404, member-not-owner = 403).
- Own-app specs: `test/errors-throttle.e2e-spec.ts` (`createTestApp({ throttle: { limit: 2, ttl: 60000 } })`), `test/events.e2e-spec.ts` (open SSE, mutate own list, expect `list.changed`, also assert a non-member's stream stays silent).
- Unit: `leave-list.use-case.spec.ts` (auto-promote / delete-last), `verify-password` bcrypt-vs-scrypt spec. Nothing else mocked.
- `globalSetup` unchanged (migrate once); app's on-boot `migrate()` is a no-op.

## Out of scope
Client (P4), data transform SQL (P3), running against the real bucket (P5), email of any kind, admin surfaces for errors/feedbacks, `activities` retention, better-auth OpenAPI plugin.

## Done
- `bun run lint && bun run test` green locally (root `lint:spell` failure from untracked `scripts/migrate-*.sh` ignored).
- e2e matrix green in `test.yml` on the PR.
- `apps/api` image builds; `GET /api/openapi/json` lists every endpoint with an `operationId`.
- CONTEXT.md unchanged unless a term shifted (none expected).

## Comments

- 2026-08-30: **done** on `feat/p2-api` (PR #4, stacked on P1's PR #1). 8 contexts (`iam list category item activity realtime report upload`), 1 migration (`0000_init.sql`, hand-edited: `unaccent`, ICU collation, subset `SET NULL`), 83 e2e + 7 unit green, `bun run lint` green (root `lint:spell` only trips on the untracked `scripts/migrate-*.sh`). Deviations from the spec text: `ActivityRecorder` is a port (lint rule: use-cases import ports only); cross-context DI via `@Global()` infra modules (feature roots can't import other features); `POST /errors` throttle lives in `ThrottlerModule.forRoot` via `AppModule.register({ throttle })` (controller-level `@Throttle` would beat the test override); `GET /events` sends `ping` events every 25 s instead of comments; `groupBy` stays client-side. **P3 notes**: better-auth 1.7 `account` has `issuer NOT NULL` + `UNIQUE(issuer, account_id)` — credential rows must carry `issuer = 'local:credential'`; `user.image` should be the S3 *public URL* (`https://colist-production-uploads.s3.us-east-2.amazonaws.com/avatars/…`), not the bare key. **P4a notes**: auth error codes map client-side (`BASE_ERROR_CODES`), presign returns `{ url, key, publicUrl }`, item create returns 200 on `clientId` replay, PATCH 404 = drop the queued op. Manual-only: Google sign-in (external), the real S3 PUT (bucket exists at P5).
