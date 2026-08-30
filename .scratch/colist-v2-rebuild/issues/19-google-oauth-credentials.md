# Google OAuth credentials

Type: task
Status: resolved

## Question

HITL setup unblocking Google login (decided in [Auth architecture decision](08-auth-architecture-decision.md)): in the Google Cloud console, with the user's Google account —

1. Create/pick a GCP project for colist.
2. Configure the OAuth consent screen (external, app name, colist.com.br domain).
3. Create an OAuth 2.0 Client ID (web application) with authorized origins/redirects for local dev (`http://localhost:*`) and prod (`https://colist.com.br`, better-auth callback `/api/auth/callback/google`).
4. Store `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` where the API's env expects them (local `.env`; prod secret storage per [AWS Terraform architecture](12-aws-terraform-architecture.md)).

Resolve by recording where the credentials live — not the values.

## Answer

Where the credentials live (values never recorded here):

- **Local dev**: `apps/api/.env.development.local` (gitignored via `.env*.local`), keys `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — vav's `.env.<mode>.local` convention per [Tooling and conventions port](14-tooling-conventions-port.md). `apps/api/.env.example` lists both keys blank once the app exists.
- **Prod**: decided in [AWS and Terraform architecture](12-aws-terraform-architecture.md) (comment left there). Not this ticket.
- **Backup**: user's password manager (console shows the secret once).
- **Not needed anywhere in CI/tests**: [API test and seed strategy](17-api-test-seed-strategy.md) ruled Google login out of e2e.

How it gets set up — HITL wizard at `scripts/setup-google-oauth.sh` (run from repo root, `ENV_FILE=…` to override). Stages: GCP project → consent screen (external, testing mode, your Gmail as test user, no authorized domain yet) → web client with `http://localhost:<port>` origin + `http://localhost:<port>/api/auth/callback/google` redirect → write `.env`.

Deviation from the original checklist: prod origin/redirect (`https://<domain>/api/auth/callback/google`) and the consent-screen authorized domain are **deferred** until [Buy domain and delegate DNS to Route 53](20-buy-domain-delegate-dns.md) resolves — Google requires exact URLs, no wildcards. Added as step 4 on ticket 20 — prod host is `colist.heloineto.com` (decided 2026-08-29, no purchase). Consent screen must also leave Testing ("Publish app") before non-test-user Gmails can sign in — do this at cutover.

## Comments

- 2026-08-29: local ports use the `5xxx` range (vav owns `4xxx`; both repos run on the same machine) — API `5100`, web `5000`, Postgres `5200`. Google client registered with origin `http://localhost:5100` + redirect `http://localhost:5100/api/auth/callback/google`. If the web dev server proxies `/api`, add `http://localhost:5000` as a second origin.
- 2026-08-29: wizard run completed by the user — `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `apps/api/.env.development.local` (gitignored, verified; wizard initially wrote `.env` — script fixed, file moved). Remaining: prod entries via ticket 20 step 4, prod storage via ticket 12.
- 2026-08-30: prod storage decided in [AWS and Terraform architecture](12-aws-terraform-architecture.md) — SSM SecureString `/colist/production/api/GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`, seeded by `scripts/setup-aws-prod.sh`, injected into the ECS task via the `ecs` module `secrets` block.
