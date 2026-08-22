# CI/CD pipeline design

Type: grilling
Status: open
Blocked by: 05, 12

## Question

Port vav's GitHub Actions pattern and settle colist's deltas.

vav's pattern: OIDC-only (zero AWS secrets, one `AWS_ACCOUNT_ID` var), SHA-pinned actions, `test.yml` (lint + unit + api e2e) called from branch workflows, `build-api.yml` on dev (native arm64 runner → ECR digest → deploy staging via `deploy-ecs.sh`), `promote-api.yml` on main (re-deploys staging's exact digest, never rebuilds), `iac.yml` (PR=plan with read-only role, push=apply), Dependabot with cooldowns.

Colist deltas:
- Branch model: keep dev→main promotion? [Database hosting decision](07-database-hosting-decision.md) locked **no staging env** (prod only), so vav's dev→staging→promote flow doesn't map 1:1 — decide what dev and main each trigger.
- Vercel fate: does the web deployment survive (landing? PWA?) and does main stay wired to it — or is Vercel retired?
- ~~If Expo: EAS build/submit/update in CI~~ — moot, PWA locked (ticket 05).
- ~~Migration step in deploy~~ — settled by ticket 07: Drizzle on-boot `migrate()`, no CI step.
