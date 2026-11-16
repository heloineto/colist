# Research Playwright and Vitest setup for a Vite SPA with a NestJS API

Type: research
Status: resolved
Blocked by:

## Question

What do current Playwright Test and Vitest docs say about: (1) Playwright `webServer` with several servers (API + Vite) and env per server, `reuseExistingServer`, readiness URLs; (2) auth via a `setup` project + `storageState` vs per-test API sign-up with `request` fixture, and cookie-based better-auth sessions behind a Vite proxy; (3) PWA service workers, `EventSource`/SSE and IndexedDB in Playwright (`serviceWorkers: 'block'`, context isolation); (4) running in GitHub Actions (browser install, caching, `--with-deps`, report artifacts, sharding not needed); (5) Vitest 4 -> 5 changes relevant to a `projects` config (voto-a-voto is on 5.0.5, Colist on 4.1.8) and whether the API must move in lockstep (syncpack); (6) current `eslint-plugin-playwright` and `@vitest/eslint-plugin` flat config usage.

## Answer

- `webServer` takes an array; entries start sequentially in array order (each awaits its `url`, ready on 2xx/3xx/400-403) and before `globalSetup`, so put API first and do DB up + migrate inside the API command. Per-entry `env`, `cwd`, `name`, `gracefulShutdown`, `reuseExistingServer: !CI`.
- Vite proxy target is hardcoded to `:5100`: make it env driven, and pass `WEB_URL` to the API so better-auth `trustedOrigins` accepts the Vite origin (cookie-bearing requests without a trusted `Origin` get 403).
- Auth: docs recommend a `setup` project over `globalSetup`, and one account per worker when tests mutate server state. Use a worker fixture that signs up via `request` (with explicit `Origin`) and saves `storageState`; cookies over http are not `Secure` in test.
- No SW in `vite` dev (vite-plugin-pwa needs `devOptions.enabled`); still set `serviceWorkers: 'block'`. Contexts are isolated, `storageState()` skips IndexedDB unless `indexedDB: true`. Test SSE end to end, not mocked.
- CI: `bunx playwright install --with-deps chromium`, no browser cache (docs advise against), upload `reports/` on `!cancelled()`, `workers: 1`, no sharding. Watch the API e2e compose teardown racing a shared Postgres.
- Vitest 5: Node >= 22.12, Vite >= 6.4, `clearMocks` default true, inline projects inherit root config, unawaited async assertions fail, `.vitest/` artifact dir. Bump web and API together: syncpack default Highest Semver and the Dependabot `vitest` group already assume it.
- Versions: `@playwright/test` 1.65.1, `vitest` 5.1.0, `eslint-plugin-playwright` 2.12.2 (`flat/recommended` on `e2e/**`), `@vitest/eslint-plugin` 1.6.28 (`configs.recommended` on specs); add `e2e` to tsconfig include and knip entries.

Full findings: [../research/playwright-vitest-setup.md](../research/playwright-vitest-setup.md)
