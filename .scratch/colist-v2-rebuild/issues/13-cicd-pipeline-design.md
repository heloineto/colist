# CI/CD pipeline design

Type: grilling
Status: resolved
Blocked by: 05, 12

## Question

Port vav's GitHub Actions pattern and settle colist's deltas.

vav's pattern: OIDC-only (zero AWS secrets, one `AWS_ACCOUNT_ID` var), SHA-pinned actions, `test.yml` (lint + unit + api e2e) called from branch workflows, `build-api.yml` on dev (native arm64 runner → ECR digest → deploy staging via `deploy-ecs.sh`), `promote-api.yml` on main (re-deploys staging's exact digest, never rebuilds), `iac.yml` (PR=plan with read-only role, push=apply), Dependabot with cooldowns.

Colist deltas:
- Branch model: keep dev→main promotion? [Database hosting decision](07-database-hosting-decision.md) locked **no staging env** (prod only), so vav's dev→staging→promote flow doesn't map 1:1 — decide what dev and main each trigger.
- Vercel fate: does the web deployment survive (landing? PWA?) and does main stay wired to it — or is Vercel retired?
- ~~If Expo: EAS build/submit/update in CI~~ — moot, PWA locked (ticket 05).
- ~~Migration step in deploy~~ — settled by ticket 07: Drizzle on-boot `migrate()`, no CI step.

## Comments

- 2026-08-29 (from [API test and seed strategy](17-api-test-seed-strategy.md)): CI test job = vav `test.yml` shape (`test:unit` then `test:e2e --filter=api`); e2e needs docker on the runner for `docker-compose.test.yml`, no seed step, migrations via Drizzle `migrate()` in globalSetup.
- 2026-08-30 (from [AWS and Terraform architecture](12-aws-terraform-architecture.md)): locked upstream — `dev` = tests only; merge to `main` = build **both** `colist-api` + `colist-web` images (always both, no path filters) → push (`colist-ecr-push`, `main` only) → `deploy-ecs.sh <cluster> <service> <family> <api-image> <web-image>` → `iac.yml` apply (`colist-tf-apply-production`, `main` only); PRs plan with `colist-tf-plan`. `promote-api.yml` dropped. Vercel fate still yours.

## Answer

Resolved 2026-08-30. vav's `.github/` ported, reshaped for prod-only. All deltas below are settled; no new tickets.

**Files** (`.github/`): `workflows/test.yml` (vav verbatim: lint + `test:unit` + `test:e2e -- --filter=api`, `workflow_call`), `workflows/main.yml`, `workflows/iac.yml`, `scripts/deploy-ecs.sh` (two-image variant per ticket 12), `dependabot.yml`. `build-api.yml` + `promote-api.yml` do not exist.

**Branch model**
- PR → `dev` or `main`, push to `dev`: `test.yml` only. No path filters.
- Push to `main` (`main.yml`, concurrency `main-production`, `cancel-in-progress: false`): jobs `apply` (`colist-tf-apply-production`, `terraform apply -auto-approve` on `iac/environments/production`, **always**, no path filter — idempotent, ~30 s) ‖ `build-api` ‖ `build-web` (both `ubuntu-24.04-arm`, native arm64 for `t4g`, `docker/build-push-action` with `cache-from/to: type=gha`, tag `git-${{ github.sha }}`, output digest) → `deploy` (`needs: [apply, build-api, build-web]`, `deploy-ecs.sh colist-production colist-production colist-production <api@digest> <web@digest>`). Tests are **not** re-run on `main` push — they gated the PR; branch protection on `main` = PR required + `Lint`/`Test` checks required, no direct pushes.
- Why apply *before* deploy in one workflow (vs vav's separate `iac.yml` apply): `deploy-ecs.sh` copies the *latest* task-def revision, so a merge that adds an env var/secret in TF and code that reads it must apply first. Cross-workflow ordering (`workflow_run`) is worse than one `needs`.
- `iac.yml` = PR plan only (`colist-tf-plan`, `-lock=false`, path-filtered on `iac/**` + itself). Rollback = `workflow_dispatch` on `main.yml` with optional `api_image`/`web_image` inputs (vav's promote resolver, minus the staging lookup) that skips the build jobs.
- OIDC only, one `AWS_ACCOUNT_ID` repo var, SHA-pinned actions, `jdx/mise-action` for toolchain, `AWS_REGION=us-east-2`.

**Vercel fate**: retired (already locked by ticket 11 step 5). What unblocks `main` *before* cutover: in the Vercel project, **Settings → Git → Disconnect** the GitHub repo — the last production deployment keeps serving, nothing rebuilds on `main` pushes. Tag current `main` as `legacy` first (`git tag legacy main && git push origin legacy`) so the frozen app stays reachable for the migration rehearsal (ticket 11). This is a HITL step → goes in `scripts/setup-aws-prod.sh` (ticket 12's wizard) right before "set `AWS_ACCOUNT_ID`", since that's the point `main` must be safe to merge into. Until that step runs, the "never commit to `main`" rule stands. Rejected: switching Vercel's production branch to `legacy` (extra live branch to guard), pausing the project (takes the old app down early), keeping Vercel for a landing page (ticket 05: Caddy serves it).

**Dependabot**: vav `dependabot.yml` minus the `uv` block; docker `directories: [/apps/api, /apps/web]`; `target-branch: dev`; same cooldowns (patch 5 d / minor 7 d / major 14 d; actions + docker `default-days: 7`), monthly, grouped `minor-and-patch` + `security`, `chore(deps)` / `chore(ci)` prefixes, assignee `heloineto`.

**Docker for api e2e** (ticket 17): no action — `ubuntu-latest` ships Docker Engine + Compose v2; `docker compose -f docker-compose.test.yml up -d` in `globalSetup` runs as-is. No service containers, no `setup-docker` action.

**`appVersion`** (ticket 16): `main.yml` passes `build-args: APP_VERSION=${{ github.sha }}` to `apps/web/Dockerfile`; Dockerfile `ARG APP_VERSION=dev` → `ENV VITE_APP_VERSION=$APP_VERSION` before `bun run build --filter=web`; client reads `import.meta.env.VITE_APP_VERSION`. Local builds report `dev`. No git call inside the build.

**`apps/web/Dockerfile`**: stage 1 = vav's `installer` (`oven/bun:<ver>-alpine`, full `bun install --frozen-lockfile`) + `bun run build --filter=web`; stage 2 = `caddy:2-alpine` + `COPY --from=builder /app/apps/web/dist /srv` + `COPY apps/web/Caddyfile /etc/caddy/Caddyfile`. `BUN_VERSION` build-arg read from `package.json#packageManager` as vav.

Rejected: rebuild-on-`dev` + promote (no staging, ticket 07); path-filtered image builds (ticket 12); re-running tests on `main` push (double cost, PR gate suffices); `workflow_run` chaining between iac and deploy; Vercel for landing/PWA.
