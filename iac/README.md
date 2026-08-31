# iac

Infrastructure-as-code for colist, deployed to AWS (us-east-2) as two containers
(`api`, `web`) on a single ECS/EC2 instance, with a private RDS Postgres and an
S3 uploads bucket. Decisions: `.scratch/colist-v2-rebuild/issues/12-aws-terraform-architecture.md`.

## Layout

| Path            | Applied by                      | Owns                                                       |
| --------------- | ------------------------------- | ---------------------------------------------------------- |
| `bootstrap/`    | a human, with admin creds       | GitHub OIDC provider + the three CI roles                  |
| `environments/` | first by hand, then CI via OIDC | the `production` app stack                                 |
| `modules/`      | -                               | shared modules (`network`, `compute`, `ecs`, `ecr`, `rds`) |

State backend: S3 (`colist-tfstate`, us-east-2), native S3 locking
(`use_lockfile`), encrypted, keys `colist/bootstrap/…` and `colist/production/…`.
The bucket predates Terraform (created by the runbook) and is only referenced,
never declared.

## Runbook

[`scripts/setup-aws-prod.sh`](../scripts/setup-aws-prod.sh) is the whole
one-time setup as an interactive wizard: state bucket → bootstrap → production
apply (zone import) → DB tunnel → SSM secrets → Vercel handover → CI variable.
It runs in two sittings (P1: through bootstrap; P5: the rest) and is resumable.

## Toolchain

Terraform is pinned in the **root** `mise.toml` alongside the rest of the
toolchain, so a single `mise install` at the repo root sets everything up. Every
task runs through bun:

```sh
bun run fix:iac              # format every .tf under iac/
bun run lint:iac             # fmt -check + validate (no creds)
bun run iac:bootstrap:apply  # apply bootstrap (manual, admin creds)
```

`fix:iac` and `lint:iac` are part of `bun run fix` and `bun run lint`, so
malformed or invalid HCL is caught by the same gate as the rest of the repo.

## Bootstrap

Applied **once, by hand, with local admin credentials** - never by CI. The roles
CI authenticates with must exist before any CI run, and CI must never be able to
create or modify them. See [`bootstrap/README.md`](bootstrap/README.md).
