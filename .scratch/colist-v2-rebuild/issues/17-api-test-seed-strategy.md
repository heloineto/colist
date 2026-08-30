# API test and seed strategy

Type: grilling
Status: resolved
Blocked by: 10

## Question

How is the new API tested and seeded? The [API stack decision](06-api-stack-decision.md) brings vav's baseline: vitest unit + e2e against dockerized Postgres, fishery/faker factories.

- Copy vav's test harness wholesale (docker-compose PG, factory-per-entity) or trim?
- Seed data: dev-environment seeds (demo lists/users) — what shape, and does the same factory code drive both tests and seeds?
- Coverage bar for the rebuild: e2e-per-endpoint, or e2e only on the tricky paths (auth, sharing, realtime invalidation)?

Blocked by [Domain model v2](10-domain-model-v2.md) — factories and seeds mirror the final entity shapes.

## Comments

- 2026-08-23 (from [Auth architecture decision](08-auth-architecture-decision.md)): vav's `e2e-jwt` TokenValidator adapter is dropped — e2e tests create real users/sessions through better-auth against the dockerized Postgres (cookie sessions). Factor the sign-in helper into the test harness design here.

## Answer

Grilled 2026-08-29, two rounds. vav's harness trimmed to what a 7-table, list-scoped domain needs.

- **Isolation: own-your-data, never truncate.** Each spec file signs up its own fresh users and creates its own lists; asserts only on data it created. Memberships scope everything, so parallel files can't see each other. vav's `sequential` vitest project and `TRUNCATE ... beforeEach` are dropped.
- **Sign-in helper: real HTTP.** `signUp(app, overrides?) → TestAgent` posts to better-auth (`/api/auth/sign-up/email`) and returns a `supertest.agent` holding the session cookie. Users come from a fishery `userFactory` (unique faker email). Sign-up/sign-in get e2e coverage for free every run; Google login stays manual (external).
- **Factories build request bodies (DTOs)**, not domain objects: `createListDto`, `createItemDto`, etc., used by e2e and any unit test alike. Domain-object factories only if a use-case unit test actually needs one.
- **Coverage bar: e2e per endpoint** (vav order: auth → validation → happy → variants). Every endpoint gets the authorization matrix — member vs owner vs **non-member** (the RLS-hole class from [Domain model v2](10-domain-model-v2.md)). Unit tests only where a use-case has real branching (owner exit → auto-promote, tolerant no-op offline ops). Not vav's mock-every-use-case habit.
- **Global-state specs boot their own app.** `POST /errors` throttling: `createTestApp({ throttle: { limit: 2, ttl } })` in its own file (covers the unauthenticated insert path too). SSE: own file, opens the stream, mutates its own list, expects a "list changed" event. Rest of the suite uses prod defaults.
- **Dev seeds: none.** Local dev runs against the production dump that [Production data migration and cutover](11-data-migration-cutover.md) already requires for rehearsal. No `bun run seed`; if ever wanted, the DTO factories make it a 40-line script through the real API.
- **Seed machinery dropped**: no `rr-seed.tar`, `gen-seed`, `seed-loader`, `pg-copy-streams`, `tar`. E2E DB starts empty after migrations.
- **Bootstrap**: vav `globalSetup` kept verbatim (`docker compose --env-file .env.test -f docker-compose.test.yml up -d --wait` / `down`), but it runs Drizzle `migrate()` once instead of TypeORM; the app's on-boot `migrate()` is then a no-op in `createTestApp()`. File layout and conventions (`test/*.e2e-spec.ts`, `src/<ctx>/test/*.mock.ts`, e2e-convention doc, CI `test:unit` then `test:e2e --filter=api`) ride on the [Tooling and conventions port](14-tooling-conventions-port.md).
