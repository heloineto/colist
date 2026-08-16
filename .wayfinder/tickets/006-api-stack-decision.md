---
title: API stack decision
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: []
---

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
