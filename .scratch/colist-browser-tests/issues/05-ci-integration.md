# CI integration for web e2e

Type: grilling
Status: resolved
Blocked by: 02, 03

## Question

Do web e2e tests run in GitHub Actions on every PR to `main` (voto-a-voto does not), and if so in which job, with what browser install, caching, timeout and failure artifacts?

## Answer

Decided by the agent (user directive), overridable in `decisions.html`.

- **Yes, on every PR to `main`.** This diverges from voto-a-voto on purpose: there, web e2e needs a real backend account; here it is self-contained (Docker Postgres + local API), and the whole point is gating Dependabot and other merges, since merge = production deploy.
- **New job `E2E (web)`** in `.github/workflows/test.yml`, parallel to `Lint` and `Test`, `timeout-minutes: 20`: checkout, mise, `bun install --frozen-lockfile`, `bunx playwright install --with-deps chromium` (in `apps/web`, no browser cache, per Playwright docs), `bun run test:e2e -- --filter=web`, then `actions/upload-artifact` of `apps/web/reports/` with `if: ${{ !cancelled() }}`, 7 day retention. Actions pinned by SHA like the rest of the file.
- **CI settings live in `playwright.config.ts`:** `workers: 1`, `retries: 2`, `forbidOnly`, trace on first retry. No sharding (a dozen specs).
- **Required check from day one** in branch protection, next to Lint and Test. Retries absorb flakes; a flaky test gets fixed, not skipped.
