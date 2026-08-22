# API stack decision

Type: grilling
Status: resolved

## Question

What is colist's API built with, and how heavy?

vav's base: NestJS 11 + Express 5, strict hexagonal bounded contexts **enforced by `eslint-plugin-project-structure`** (`apps/api/project-structure.mjs`), TypeORM + hand-written migrations, nestjs-zod DTOs, OpenAPI → orval → typed react-query client, pino logging via a Logger port, JWT bearer + guard chain, vitest unit + e2e against dockerized Postgres.

Colist is 7 tables of CRUD. Discuss (`/grilling`):
- Replicate vav wholesale (consistency across the user's projects, lint-enforced architecture already written) vs a lighter stack (e.g. Hono + Drizzle) for a much smaller domain.
- ORM: TypeORM (vav parity) vs Drizzle/Prisma.
- Type-sharing contract: OpenAPI+orval (vav pattern, client-agnostic — works for RN and web) vs tRPC.
- Which vav API patterns come regardless: zod ConfigSchema env parsing, query-param DSL, QueryBoundary-style states, global query-client notification handlers.
- Storage replacement for avatar uploads (Supabase Storage + TUS today) — presumably S3 presigned uploads via the API; decide here.

Recommendation on file: replicate vav's shape (NestJS + TypeORM + OpenAPI/orval) at reduced ceremony — fewer contexts, same layer rules — unless grilling surfaces appetite for a lighter stack.

## Answer

Resolved 2026-08-16 by grilling.

**Stack: vav wholesale (option A).** User is done cutting corners on the backend — wants it fully fleshed: nice documentation, extensible. So: NestJS 11 + Express 5, hexagonal bounded contexts enforced by `eslint-plugin-project-structure` (copy `apps/api/project-structure.mjs`), TypeORM + hand-written migrations, nestjs-zod DTOs, OpenAPI → orval typed react-query client, pino via Logger port, vitest unit + e2e against dockerized Postgres.

- **ORM: TypeORM**, explicitly. User is iffy about it but keeps it for the NestJS integration — Drizzle rejected for now.
  - **Superseded 2026-08-22**: user reversed this during the [Database hosting decision](07-database-hosting-decision.md) — **Drizzle ORM**, chosen as the future-proof tool with a better migration story (`drizzle-kit generate` → versioned SQL, programmatic `migrate()` on boot). "Hand-written migrations" above becomes drizzle-kit-generated SQL.
- **Avatar storage: S3 + presigned PUT** (API issues URL, client PUTs, API stores key). TUS/resumable dropped — avatars are tiny.
- **Patterns ported from vav**: zod ConfigSchema env parsing, QueryBoundary-style states, global query-client notification handlers.
- **Skipped**: vav's query-param DSL — endpoints take explicit params; add a DSL only when a param list hurts.
- How many bounded contexts colist gets is [Domain model v2](10-domain-model-v2.md)'s call, not this ticket's.

**Routed elsewhere during grilling:**
- Realtime requirement sharpened: coarse invalidation is enough — server notifies "list changed", clients refetch (today's refetch mechanism works wonders; Supabase's fine-grained control was overkill). Noted on [Realtime and offline strategy](09-realtime-offline-strategy.md).
- User owns the official NestJS Authentication & Authorization course and wants its concepts applied to colist's auth. Subtitles at `D:\Courses\NestJS Courses\06 NestJS - Authentication and Authorization` (WSL: `/mnt/d/Courses/NestJS Courses/06 NestJS - Authentication and Authorization`) — **still generating, do not read yet**; read them when working [Auth architecture decision](08-auth-architecture-decision.md). Noted there.
