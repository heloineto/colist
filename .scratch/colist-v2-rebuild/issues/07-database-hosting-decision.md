# Database hosting decision

Type: grilling
Status: resolved

## Question

Where does colist's Postgres live once Supabase is gone? Note vav never solved this — its "own API" still points at Supabase-hosted Postgres, and ADR 0004 defers Aurora. Colist would be the first project to actually exit.

Options to grill:
- RDS (t4g.micro single-AZ — cheapest managed, ~$12-15/mo).
- Postgres container on the same ECS-on-EC2 instance (vav already runs plain `postgres` in docker-compose locally; near-zero cost, backup/durability is on you — EBS snapshots).
- Aurora Serverless v2 (scales to ~zero now? verify pricing floor).
- Neon/other serverless PG (managed, generous free tier, but a new vendor — user is consolidating onto AWS).

Also decide: staging DB (shared instance? none?), backup policy, and how migrations run in CI/CD.

## Answer

Resolved 2026-08-22 by grilling.

**Prod Postgres: RDS db.t4g.micro, single-AZ, us-east-2** (follows vav's region ADR 0004). ~$14/mo incl. 20GB gp3; user's AWS free credits cover it initially (note: post-July-2025 accounts get $200/6mo credits, not the legacy 12-month RDS free tier). Provisioned in Terraform (`aws_db_instance`) — colist becomes the first project to actually exit Supabase-hosted Postgres.

- **Rejected**: Postgres container on the ECS EC2 box (couples DB to API-box lifecycle, DIY backups); Aurora Serverless v2 (15s resume from zero, ~$44/mo if warm — dominated by RDS at this scale); Neon (new vendor — AWS-only is a hard rule); Aurora DSQL (not full Postgres: no extensions, optimistic concurrency).
- **Backup policy**: RDS automated daily backups + point-in-time recovery, 7-day retention. Nothing to build.
- **Staging: none.** No staging environment at all — local docker-compose Postgres for dev, prod is the only deployed DB. Diverges from vav's dev→staging→promote CI/CD flow; flagged on [CI/CD pipeline design](13-cicd-pipeline-design.md).
- **Migrations: Drizzle, on-boot.** User switched ORM from TypeORM to **Drizzle** during this grilling (supersedes part of the [API stack decision](06-api-stack-decision.md) — amended there). Workflow: `drizzle-kit generate` produces versioned SQL files in dev; the API calls programmatic `migrate()` on boot (single instance, no race). `drizzle-kit push` is local-prototyping only; no CI migration step needed.
- **Current Vercel + Supabase deployment stays frozen** during the rebuild; data export/migration happens at cutover ([Data migration and cutover](11-data-migration-cutover.md)). Data-loss tolerance is low-stakes (shopping lists, alpha).
