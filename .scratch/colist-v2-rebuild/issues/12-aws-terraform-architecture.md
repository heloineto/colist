# AWS and Terraform architecture

Type: grilling
Status: resolved
Blocked by: 05, 06, 07, 20

## Question

Port vav's iac pattern to colist and settle the colist-specific deltas.

vav's pattern (the base): `iac/bootstrap` (human-applied: GitHub OIDC provider + 4 scoped CI roles with anti-lockout Denies) / `iac/environments/{staging,production}` (CI-applied, directories not workspaces) / `iac/modules`; S3 state bucket with native locking; ECS on a single `t4g.small` EC2, api + caddy containers in host network mode, EIP, no ALB; ECR immutable tags owned by staging; SSM SecureString secrets seeded by hand; CloudWatch logs + system-status auto-recover; Cloudflare grey-cloud DNS by hand; us-east-2.

Colist deltas to decide:
- One env or staging+production? (Alpha app, one user-developer — staging may be ceremony.)
- Instance sizing (t4g.micro/small), same region?
- DB resources per the hosting decision; where avatar S3 bucket lives.
- Domain: `colist.heloineto.com` — Route 53 hosted zone delegated from GoDaddy (ticket 20); TLS via Caddy same as vav. Single host, web + `/api/*`.
- Naming prefix (`colist-` vs vav's `vav-`), state bucket name.
- Write the runbook vav lost (SSM seeding, DNS record, bootstrap apply).

## Comments

- 2026-08-29 (from [Google OAuth credentials](19-google-oauth-credentials.md)): decide prod secret storage for `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (+ `BETTER_AUTH_SECRET`, DB URL) — SSM Parameter Store SecureString vs Secrets Manager, and how they reach the ECS task (vav `ecs` module `secrets` block?). Local side is done; only prod is open.

## Answer

Resolved 2026-08-30 by grilling. vav's iac ported wholesale, minus staging.

**Account / region / naming**: AWS account `547279162914` (profile `voto-a-voto`, SSO), us-east-2. Prefix `colist`, `name_prefix = colist-production`. State bucket `colist-tfstate` (hand-created by the wizard, does not exist yet), keys `colist/bootstrap/…` and `colist/production/…`, native S3 locking. Hosted zone `Z0692102Z0YEGOX1LW1O` verified in this account.

**Layout**: `iac/{bootstrap,environments/production,modules}` — vav verbatim minus `staging/` (ticket 14 diff-ability). The `ecr` module call moves into `production/main.tf`; `data "aws_ecr_repository"` dies. Two repos: `colist-api`, `colist-web`, immutable tags = git SHA, vav lifecycle policy.

**CI roles (bootstrap)**: three — `colist-ecr-push` (`main`), `colist-tf-plan` (pull requests, read-only, `-lock=false`), `colist-tf-apply-production` (`main`). Anti-lockout Denies list these three. `dev` = tests only; merge to `main` = build both images → push → `deploy-ecs.sh` → `iac.yml` apply. No promotion, rebuild per `main` merge, **always both images** (no path-filtering). `promote-api.yml` dropped. Apply role gains `route53:*` + `s3:*` on the uploads bucket; plan role gains `route53:Get*/List*`.

**Compute**: `t4g.small` (2 GB; micro's 1 GB has no headroom), ECS on EC2, host network mode, EIP, no ALB, EC2 auto-recovery alarm, SSM Session Manager (no SSH) — vav `compute`/`network` modules unchanged.

**Web delivery**: `apps/web` builds a `colist-web` image `FROM caddy:2-alpine` + `COPY dist /srv` + `COPY Caddyfile /etc/caddy/`. Caddyfile lives in `apps/web` (`colist.heloineto.com { handle /api/* { reverse_proxy localhost:5100 } handle { root * /srv; try_files {path} /index.html; file_server } }`). `ecs` module loses the `CADDYFILE` env hack and `hostname` var; `caddy` container → `web` container from ECR; cert volume `/opt/caddy/data` stays. `deploy-ecs.sh` takes two images, swaps `api` + `web` in one revision.

**Secrets**: SSM SecureString `/colist/production/api/{DATABASE_URL,BETTER_AUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET}`, seeded by the wizard, injected via vav `ecs` `secrets` block. Secrets Manager rejected (paid, rotation unused) except RDS's own managed master password (free) — the wizard reads it and assembles `DATABASE_URL=postgres://…?sslmode=require`. Non-secret config as plain task-def `environment`: `MODE=production`, `PORT=5100`, `BETTER_AUTH_URL=https://colist.heloineto.com`, `UPLOADS_BUCKET`. API uses `DATABASE_URL` only (no `POSTGRES_*` pieces) — compose/test env follow.

**RDS**: vav `rds` module, `db.t4g.micro` Postgres 17, gp3 20 GB, 7-day backups, `rds.force_ssl=1`, deletion protection — **but private**: `publicly_accessible = false`, `allowed_cidrs` var deleted, SG allows 5432 from the API SG only. Local admin (DBeaver) and the cutover load go through an SSM port-forward on the EC2 box: `scripts/db-tunnel.sh` = `aws ssm start-session --target <instance> --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters host=<rds>,portNumber=5432,localPortNumber=5432` → connect to `localhost:5432`. Needs `session-manager-plugin` (not installed yet — wizard step).

**S3**: one bucket `colist-production-uploads`, prefixes `avatars/`, `errors/`, `feedbacks/`, declared inline in `production/main.tf`. Private; presigned PUT for all writes; bucket policy grants anonymous `GetObject` on `avatars/*` only (`user.image` = plain URL); `BlockPublicAcls` on, `BlockPublicPolicy` off. CORS `PUT,GET` from `https://colist.heloineto.com` + `http://localhost:5000`. New **ECS task role** (`task_role_arn` added to `ecs` module) with `s3:PutObject/GetObject/DeleteObject` on the bucket. Local dev hits the real bucket via the `voto-a-voto` profile — no LocalStack/MinIO.

**DNS/TLS**: `aws_route53_zone` imported into the production stack (`prevent_destroy`) + `A` record → EIP. No `AAAA` (IPv4-only VPC). Caddy Let's Encrypt HTTP-01 as vav; no Cloudflare.

**Runbook = HITL wizard** `scripts/setup-aws-prod.sh` (`/wizard`, same library as the other two), `iac/README.md` links it. Order: `aws sso login` → create `colist-tfstate` → `bootstrap` init/apply (admin creds, once) → `production` init → `terraform import` zone → `production apply` (first apply by hand; CI owns it afterwards via shared S3 state) → install `session-manager-plugin` → tunnel → read RDS master secret → seed 4 SSM params → set `AWS_ACCOUNT_ID` GitHub var → first `main` merge deploys → `curl https://colist.heloineto.com/health`. ECS service sits pending until the first image push, as in vav.

**Toolchain**: terraform pinned in root `mise.toml`, `fix:iac` / `lint:iac` / `iac:bootstrap:*` scripts as vav (ticket 14).

Rejected: staging dir (ticket 07); flat `iac/production` layout; web via NestJS `ServeStatic` or S3 website; Secrets Manager for app secrets; public RDS + IP allowlist (rotating home IP → stale allowlist); zone in bootstrap; presigned-GET avatars; LocalStack; path-filtered builds; `t4g.micro`.
