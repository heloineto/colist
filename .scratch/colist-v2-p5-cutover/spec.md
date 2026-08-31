# P5 — Deploy & cutover

Status: soaking — migrated 2026-08-31, teardown after 2026-09-07
Source: [Implementation phasing § P5](../colist-v2-rebuild/issues/18-implementation-phasing.md) + tickets [12 AWS/Terraform](../colist-v2-rebuild/issues/12-aws-terraform-architecture.md), [13 CI/CD](../colist-v2-rebuild/issues/13-cicd-pipeline-design.md), [11 migration/cutover](../colist-v2-rebuild/issues/11-data-migration-cutover.md), [19 Google OAuth](../colist-v2-rebuild/issues/19-google-oauth-credentials.md), [20 DNS delegation](../colist-v2-rebuild/issues/20-buy-domain-delegate-dns.md).
Branch: none of its own — P5 lands the stack on `dev`, then PRs `dev` → `main`.

Base facts:
- PR stack all draft/unmerged: #2 (`feat/p0-scaffold`→`dev`) ← #1 ← #4 ← #5 ← #6 ← #7 (`feat/p4b-offline`→`feat/p4a-web`). All `MERGEABLE`.
- Wizard `scripts/setup-aws-prod.sh`: P1 sitting done (SSO, `colist-tfstate`, bootstrap roles, `AWS_ACCOUNT_ID` var, `main` protection). `--resume` = 10-stage P5 sitting from "Production stack: init + import".
- Hosted zone `Z0692102Z0YEGOX1LW1O` hand-created, **pending `terraform import`** (NS in `../colist-v2-rebuild/route53.env`); wizard stage covers it.
- Google prod creds: `apps/api/.env.development.local` + password manager; prod origin/redirect + authorized domain already set (ticket 20 step 4). Consent screen still **Testing** — publish at cutover.
- Migration: `scripts/migrate-legacy.sh` (rehearsed on the real dump, 47 users / 896 items) via `scripts/db-tunnel.sh` — prod RDS is private, load targets `localhost:5432` through SSM port-forward. Avatars → `s3://colist-production-uploads/avatars/`.
- Gate: `bun run lint && bun run test`; root `lint:spell` trips only on untracked `scripts/migrate-*.sh` — known, ignore.
- Local dev servers may linger from P4b (API :5100, vite **preview** :5000) — kill before any restart.

## Scope

### 1. Land the PR stack on `dev`
Merge bottom-up: mark ready + merge #2, then #1, #4, #5, #6, #7 (GitHub retargets each child to `dev` when its base branch is deleted on merge). One merge per phase in `dev` history; delete `feat/p*` branches as they land. `test.yml` gates each.

### 2. Resume wizard (HITL — user present)
`bash scripts/setup-aws-prod.sh --resume`: production init + zone import → first apply by hand → `session-manager-plugin` → tunnel → RDS managed master secret → seed 4 SSM SecureStrings (`/colist/production/api/{DATABASE_URL,BETTER_AUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET}`) → **`legacy` tag + Vercel Settings → Git → Disconnect** (this unfreezes `main`) → first deploy + smoke stage.

### 3. First `main` merge = deploy
PR `dev` → `main` (/create-pr); merge once green. `main.yml`: apply ‖ build-api ‖ build-web (arm64, `APP_VERSION=sha`) → `deploy-ecs.sh` both digests. ECS service sits pending until images exist — first merge fills it. Smoke: `https://colist.heloineto.com/health`, sign-up, sign-in, SSE, Google login (Testing consent → test user only). /fix-pr-checks if red.

### 4. Migration cutover (~1 h downtime)
1. WhatsApp freeze announcement with the new URL (user sends).
2. `scripts/db-tunnel.sh` up → `scripts/migrate-legacy.sh` against prod RDS: export Supabase → transform → TRUNCATE-and-load → avatars → S3 → `setval`s → sign-in smoke.
3. All sessions reset — users log in again. Old Vercel URL keeps serving the frozen app (no redirect, dies at teardown).

### 5. Soak (1 week) + teardown
- Soak: watch CloudWatch logs + `errors` table; users on the new URL.
- After soak: Supabase project **paused** (delete +30 d), Vercel project **deleted**, `scripts/migrate-legacy.sh` + transform SQL deleted from the repo, Google consent screen **published** (leaves Testing).

## Done
- Stack merged; `dev` → `main` merged; `main.yml` green; smoke passes on `https://colist.heloineto.com`.
- Prod DB carries the migrated data; a real user's password works; avatars render.
- Soak complete; Supabase paused; Vercel project deleted; map updated.

## Comments

- 2026-08-31 — Cutover done. Stack landed via async merge API (stacked PRs need `merge-async` + manual cascade). First deploy 502'd: node-pg `sslmode=require` verifies CA → bundled RDS global CA in the image (`ADD --chmod=644`, mode 0600 broke `USER bun`) + `sslrootcert=/app/rds-ca.pem` in the SSM `DATABASE_URL`. Health moved to `/api/health` (bare `/health` fell through Caddy to the SPA; global prefix now has no exclude). `.gitignore` `reports/` → `/reports/` (generated client file was untracked, broke CI). i18next 25.10 Locize console notice silenced (`showSupportNotice: false`, PR #19). Migration: 47 users / 43 lists / 899 items loaded through the SSM tunnel (idle-timeout kills the session — keepalive ping needed), avatars in S3, sign-in smoke ✓. `legacy` staging schema dropped from prod 2026-08-31. Sessions reset by TRUNCATE as planned.
