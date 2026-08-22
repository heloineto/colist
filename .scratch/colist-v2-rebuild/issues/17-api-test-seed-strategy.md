# API test and seed strategy

Type: grilling
Status: open
Blocked by: 10

## Question

How is the new API tested and seeded? The [API stack decision](06-api-stack-decision.md) brings vav's baseline: vitest unit + e2e against dockerized Postgres, fishery/faker factories.

- Copy vav's test harness wholesale (docker-compose PG, factory-per-entity) or trim?
- Seed data: dev-environment seeds (demo lists/users) — what shape, and does the same factory code drive both tests and seeds?
- Coverage bar for the rebuild: e2e-per-endpoint, or e2e only on the tricky paths (auth, sharing, realtime invalidation)?

Blocked by [Domain model v2](10-domain-model-v2.md) — factories and seeds mirror the final entity shapes.
