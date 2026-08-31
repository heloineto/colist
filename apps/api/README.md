# Colist API

NestJS 11 + Express 5, hexagonal layout enforced by `project-structure.mjs`. Inherits root [`CLAUDE.md`](../../CLAUDE.md). Served under `/api/*` (Caddy proxies unstripped).

## Contexts

`iam` (better-auth mount, guards, `/me`, `/users/lookup`) · `list` (lists, memberships, `MembershipGuard`) · `category` · `item` · `activity` (history + `ActivityRecorder` → `list.changed` events) · `realtime` (`GET /events` SSE) · `report` (`/errors` public+throttled, `/feedbacks`) · `upload` (S3 presigned PUT).

## Auth

better-auth handles `/api/auth/*` (email+password, Google, cookie sessions in Postgres). It's mounted **before** the JSON body parser (`bodyParser: false` + `mountBetterAuth(app)` + `useBodyParser('json')`, see `main.ts`). Everything else is guarded by default; opt out with `@Auth(AuthType.None)`. List-scoped routes add `@UseGuards(MembershipGuard)` (+ `@ListRole('owner')`).

Docs: `/api/docs` (Scalar), spec: `/api/openapi/json` (orval input). better-auth routes aren't in the spec — the web client uses `better-auth/react`.

## Env

See `.env.example`. Prod gets `MODE/PORT/BETTER_AUTH_URL/UPLOADS_BUCKET` plain and `DATABASE_URL/BETTER_AUTH_SECRET/GOOGLE_*` from SSM. `AWS_PROFILE` only locally (presigning works without the bucket; the PUT itself needs it).

## Database

Drizzle ORM. Edit `src/<ctx>/infrastructure/persistence/drizzle/*.schema.ts`, run `bun run gen:migration`, commit the SQL under `migrations/`. The API applies pending migrations on boot (`DrizzleModule.onModuleInit`) — no CI step. Hand edits drizzle can't express live in the SQL only: `COLLATE "pt-BR-x-icu"` on `name` columns, `ON DELETE SET NULL (category_id)`, `CREATE EXTENSION unaccent`.

## Testing

- Unit: `bun run test:unit` — `*.spec.ts` colocated with source.
- E2E: `bun run test:e2e` — `test/*.e2e-spec.ts`; `test/global-setup.ts` starts Postgres via `docker-compose.test.yml` (port 5300), runs migrations, tears down after. Conventions: [`docs/api/e2e-convention.md`](../../docs/api/e2e-convention.md).
