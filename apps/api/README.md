# Colist API

NestJS 11 + Express 5, hexagonal layout enforced by `project-structure.mjs`. Inherits root [`CLAUDE.md`](../../CLAUDE.md).

## Database

Drizzle ORM. Edit `src/<ctx>/infrastructure/persistence/drizzle/*.schema.ts`, run `bun run gen:migration`, commit the SQL under `migrations/`. The API applies pending migrations on boot (`DrizzleModule.onModuleInit`) — no CI step.

## Testing

- Unit: `bun run test:unit` — `*.spec.ts` colocated with source.
- E2E: `bun run test:e2e` — `test/*.e2e-spec.ts`; `test/global-setup.ts` starts Postgres via `docker-compose.test.yml` (port 5300), runs migrations, tears down after. Each spec owns its data; nothing is truncated.
