# P1 — Infra & CI code

Status: in progress
Source: [Implementation phasing § P1](../colist-v2-rebuild/issues/18-implementation-phasing.md) + tickets [12](../colist-v2-rebuild/issues/12-aws-terraform-architecture.md), [13](../colist-v2-rebuild/issues/13-cicd-pipeline-design.md).
Branch: `feat/p1-infra-ci` (off `feat/p0-scaffold`, P0 PR to `dev` still pending) → PR to `dev`. `main` untouched.
Reference: `/home/heloi/programming/voto-a-voto/{iac,.github}` (read-only). Copy wholesale, edit the deltas.

## Scope

### 1. `iac/` (ticket 12) — vav verbatim minus `staging/`
- `bootstrap/`: project `colist`, repo `heloineto/colist`, state `colist-tfstate` / `colist/bootstrap/…`. Roles: `colist-ecr-push` (`main`), `colist-tf-plan` (PRs, `-lock=false`), `colist-tf-apply-production` (`main`). Anti-lockout Denies list the three. Apply role gains `route53:*` + `s3:*` on `colist-production-uploads`; plan role gains `route53:Get*/List*`.
- `environments/production/`: `ecr` module called inline (`colist-api`, `colist-web`), `data "aws_ecr_repository"` deleted. Uploads bucket `colist-production-uploads` inline (private, public-read `avatars/*` via bucket policy, `BlockPublicPolicy=false`, CORS PUT/GET from `https://colist.heloineto.com` + `http://localhost:5000`). ECS task role with `s3:{Put,Get,Delete}Object` on it. `aws_route53_zone` (`prevent_destroy`, imported by hand) + `A` record → EIP. Outputs: `eip_public_ip`, `instance_id`, `db_address`, `db_master_user_secret_arn`, `zone_id`, `uploads_bucket`.
- `modules/ecs`: `web` container from ECR (replaces `caddy` image + `CADDYFILE` hack; `hostname` var dies), `task_role_arn` var, api env `MODE/PORT/BETTER_AUTH_URL/UPLOADS_BUCKET`, secrets `DATABASE_URL/BETTER_AUTH_SECRET/GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET`, `api_port` 5100.
- `modules/rds`: `publicly_accessible=false`, `allowed_cidrs` deleted (SG = API SG only).
- `modules/{network,compute,ecr}` unchanged.
- READMEs rewritten for prod-only; `iac/README.md` links the wizard.
- Root `package.json`: `fix:iac`, `lint:iac`, `iac:bootstrap:{init,plan,apply}` as vav; `lint`/`fix` include them.

### 2. `.github/` (ticket 13)
- `workflows/main.yml`: push `main` + `workflow_dispatch` (`api_image`/`web_image` inputs = rollback, skips builds). Jobs `apply` ‖ `build` (matrix `api`/`web`, `ubuntu-24.04-arm`, `git-<sha>` immutable tags, gha cache per app, `APP_VERSION` build-arg) → `deploy` resolves tags to digests via `ecr describe-images` (no job outputs) → `deploy-ecs.sh` two digests. Concurrency `main-production`, no cancel.
- `workflows/iac.yml`: PR plan only (`colist-tf-plan`, `-lock=false`), path-filtered `iac/**` + itself.
- `workflows/test.yml`: P0 copied it `workflow_call`-only with no caller (vav's caller was its `main.yml`). Deviation: give it `pull_request` → `dev`/`main` + `push` → `dev` triggers directly; no extra caller file.
- `scripts/deploy-ecs.sh`: `<cluster> <service> <family> <api-image> <web-image>`.
- `dependabot.yml`: vav minus `uv`; docker dirs `/apps/api`, `/apps/web`.
- `CODEOWNERS` copied.

### 3. Scripts
- `scripts/setup-aws-prod.sh` (wizard, full runbook): sso login → create `colist-tfstate` → bootstrap init/apply → **STOP marker (P1)** → production init → import zone `Z0692102Z0YEGOX1LW1O` → apply → session-manager-plugin → tunnel → RDS secret → 4 SSM params → `legacy` tag + Vercel disconnect → first `main` merge → smoke. Deviation from ticket 13: `AWS_ACCOUNT_ID` var + `main` branch protection are set in the P1 sitting (plan job needs the id; only the read-only role is reachable while `main` is frozen). `--resume` flag runs the P5 sitting.
- `scripts/db-tunnel.sh`: SSM port-forward to RDS on `localhost:5432` (reads instance id + RDS host from `terraform output`).

## Out of scope
Running production apply / SSM seeding / Vercel disconnect (P5). API code (P2). Any secrets in git.

## Done
- `bun run lint && bun run test` green (incl. `lint:iac` validate of both stacks).
- `iac.yml` plan green on the PR (needs bootstrap applied + `AWS_ACCOUNT_ID` var — plan role only).
- Bootstrap applied by hand via the wizard; wizard stops at the P1 marker.
- `test.yml` gating PRs.
