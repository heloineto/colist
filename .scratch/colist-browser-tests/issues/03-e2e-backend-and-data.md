# E2E backend, auth and test data

Type: grilling
Status: resolved
Blocked by: 01

## Question

What does the browser talk to during e2e (real API on a throwaway DB, the dev stack, mocked routes, production?), how is the session obtained (UI sign-up in a setup project, API sign-up per test), and how do parallel tests keep their data apart, including flows that need two users (sharing, realtime)?

## Answer

Decided by the agent (user directive), overridable in `decisions.html`.

- **Real stack, throwaway DB.** The browser drives Vite dev, which proxies to a real API booted with `NODE_ENV=test` (`apps/api/.env.test`) against its own Postgres. No mocked routes (they would hide exactly the API/UI contract breaks we want), no production (only prod exists, merge = deploy), no dev DB (no pollution, deterministic). voto-a-voto points at a shared backend with a real account; Colist cannot, because it has no staging.
- **Own ports and compose project** so it never races the API e2e suite (whose teardown runs `docker compose down` on `colist-api-test`) nor a running dev stack: Postgres `5400` (`docker compose -p colist-web-e2e` reusing `apps/api/docker-compose.test.yml` with `POSTGRES_PORT=5400`), API `5401`, Vite `5402`. Root `bun run test:e2e` can then run both suites in parallel.
- **`webServer` array, API first** (Playwright starts entries in order and waits for each `url`): (1) new API script `start:e2e` = compose up `--wait` + `nest start` (migrations already run on boot in `DrizzleModule.onModuleInit`), env overrides `PORT=5401`, `DATABASE_URL` on 5400, `BETTER_AUTH_URL=http://localhost:5401`, `WEB_URL=http://localhost:5402`; url `http://localhost:5401/api/health`. (2) `vite --port 5402 --strictPort` with `API_URL=http://localhost:5401`. `globalTeardown` runs `docker compose -p colist-web-e2e down`.
- **Two code changes this needs:** `vite.config.ts` proxy target reads `process.env.API_URL ?? 'http://localhost:5100'` (for `/api` and `/.well-known`); the API gets `WEB_URL` so better-auth `trustedOrigins` accepts the Vite origin (else cookie requests get 403).
- **Session: worker-scoped `account` fixture** in `e2e/fixtures.ts`: signs up through `POST /api/auth/sign-up/email` with the `request` fixture (explicit `Origin: http://localhost:5402`), unique email `e2e-<workerIndex>-<timestamp>@colist.test`, saves `playwright/.auth/<workerIndex>.json`, and the test-scoped `storageState` uses it. No `setup` project: voto's single account works because its tests only read; Colist tests write, and Playwright's docs recommend one account per worker for that. Cookies are not `Secure` over http in test mode.
- **Isolation:** one account per worker plus a uniquely named list per test; the DB is thrown away each run, so no cleanup code. A test-scoped `secondUser` fixture (fresh account + its own `browser.newContext`) covers sharing and realtime. The UI sign-up/sign-in form is covered by its own spec, not by the fixture. Throttling is not a concern (only `POST /api/errors` is throttled; better-auth rate limit is off outside production). IndexedDB is not part of `storageState`, so the persisted React Query cache never leaks between tests.
