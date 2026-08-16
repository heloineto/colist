---
title: Database hosting decision
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: []
---

## Question

Where does colist's Postgres live once Supabase is gone? Note vav never solved this — its "own API" still points at Supabase-hosted Postgres, and ADR 0004 defers Aurora. Colist would be the first project to actually exit.

Options to grill:
- RDS (t4g.micro single-AZ — cheapest managed, ~$12-15/mo).
- Postgres container on the same ECS-on-EC2 instance (vav already runs plain `postgres` in docker-compose locally; near-zero cost, backup/durability is on you — EBS snapshots).
- Aurora Serverless v2 (scales to ~zero now? verify pricing floor).
- Neon/other serverless PG (managed, generous free tier, but a new vendor — user is consolidating onto AWS).

Also decide: staging DB (shared instance? none?), backup policy, and how migrations run in CI/CD.
