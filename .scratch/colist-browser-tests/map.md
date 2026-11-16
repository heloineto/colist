# Colist browser tests: Wayfinder Map

Effort: `colist-browser-tests`. Tracker conventions: `docs/agents/issue-tracker.md` (local markdown). Research findings live in `research/`.

## Destination

Every decision locked, ready to hand to `/implement`, for browser tests in `apps/web`: Playwright e2e (real browser driving the real SPA + API) and Vitest unit tests, mirroring the setup in `../voto-a-voto/apps/web/`, so dependency bumps (Mantine, React, TanStack) stop shipping to production unverified.

## Notes

- **User directive (2026-11-15):** no grilling questions. The agent researches and decides every grilling ticket itself with its own recommendation, then presents all decisions in one `/create-html` page (`decisions.html`) for the user to override.
- Reference pattern (`../voto-a-voto/apps/web/`): `playwright.config.ts` (testDir `e2e/`, outputDir `reports/test/`, `webServer` = dev server with `reuseExistingServer: !CI`, `setup` project writing `playwright/.auth/user.json`, one `Desktop Chrome` project, `trace: 'retry-with-trace'`); `e2e/auth.setup.ts`, `e2e/fixtures.ts` (`base.extend`), `e2e/*.spec.ts`; `vitest.config.ts` with `projects` (`unit` node env, `storybook` browser via `@vitest/browser-playwright`); scripts `test` = `test:e2e && test:unit`, `test:e2e` = `playwright test`; `eslint-plugin-playwright` on `e2e/**`; knip entry `e2e/**`; gitignore `/playwright/.auth`, `/reports/`. Its CI runs only `test:unit` + API e2e (web e2e hits a real dev backend with a real account, locally only).
- Colist today: Vite SPA (TanStack Router, Mantine 9, i18next pt/en/es, orval client, React Query persisted to IndexedDB, SSE via `EventSource`, `vite-plugin-pwa`), Vite dev on `:5000` proxies `/api` to the API on `:5100`. Vitest 4.1.8, 4 unit specs (`src/**/*.spec.ts`). No Storybook. Only production exists (trunk-based, merge to `main` = deploy), no staging.
- API e2e already boots a throwaway Postgres (`apps/api/docker-compose.test.yml`, port 5300) and migrates it in `test/global-setup.ts`; committed `apps/api/.env.test` (`NODE_ENV=test`, API port 5301). better-auth has email + password enabled, plus Google.
- Skills: `/research` (research tickets), `ctx7` for library docs, `/create-html` for the decisions page.

## Decisions so far

- [Research Playwright and Vitest setup for a Vite SPA with a NestJS API](issues/01-research-playwright-vitest-setup.md): Playwright 1.65 / Vitest 5.1; `webServer` array starts in order; Vite proxy hardcoded + missing `WEB_URL` block e2e; per-worker accounts; no SW in vite dev; CI installs chromium `--with-deps`, no cache.
- [Test layers and harness layout](issues/02-test-layers-and-harness.md): Vitest unit + Playwright e2e only (no Vitest browser project); Vitest 5 lockstep; voto-a-voto layout with `on-first-retry`, `pt-BR` locale, SW blocked, Desktop + Mobile Chrome.
- [E2E backend, auth and test data](issues/03-e2e-backend-and-data.md): real API (`NODE_ENV=test`) on own Postgres `colist-web-e2e` (5400/5401/5402); `API_URL` proxy + `WEB_URL`; worker `account` fixture signs up via API; `secondUser` for sharing.
- [First e2e coverage](issues/04-first-e2e-coverage.md): auth, lists, items, sharing + SSE realtime; no unit backfill.
- [CI integration for web e2e](issues/05-ci-integration.md): new `E2E (web)` job on every PR, chromium only, report artifact, required check.
- [Implementation phasing and handoff](issues/06-implementation-phasing.md): PR `chore/vitest-5` -> `test/web-e2e-harness` (+ auth spec, CI) -> `test/web-e2e-flows`; `/implement` effort `colist-browser-tests-impl`.

**Map complete 2026-11-15.** User approved every decision ([decisions page](decisions.html)).

**Implementation (started 2026-11-15):** stacked draft PRs by subagents: `chore/vitest-5` -> `test/web-e2e-harness` -> `test/web-e2e-flows`.

## Not yet specified

- Second e2e batch: history drawer, profile edit, connected apps + OAuth consent, language switch, offline mode, feedback attachments (S3). Graduates after the first batch is stable.

## Out of scope

- Visual regression (screenshot diffing) and Storybook: voto-a-voto's Vitest browser project exists only to run stories; Colist has no stories.
- Testing Google sign-in end to end: needs real Google credentials; email + password covers the session path.
