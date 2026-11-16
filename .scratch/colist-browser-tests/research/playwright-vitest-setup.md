# Playwright + Vitest setup for Colist web

Answers ticket `issues/01-research-playwright-vitest-setup.md`. Researched 2026-11-15.

Sources: Playwright docs via ctx7 (`/websites/playwright_dev`), Playwright 1.64.1 runner source (`voto-a-voto/apps/web/node_modules/playwright/lib/runner/index.js`), Vitest migration guide at tag `v5.1.0`, vite-plugin-pwa docs, better-auth source via ctx7, syncpack docs, plugin READMEs, `npm view`. No ctx7 quota errors.

## Current versions (npm, 2026-11-15)

| Package | Latest | Colist today | voto-a-voto |
| --- | --- | --- | --- |
| `@playwright/test` | 1.65.1 (2026-11-13) | none | ^1.64.1 |
| `vitest` | 5.1.0 (2026-11-02); 4.x line ends at 4.1.12 | ^4.1.8 (web + api) | ^5.0.5 |
| `eslint-plugin-playwright` | 2.12.2 (peer `eslint >=8.40`) | none | ^2.12.1 |
| `@vitest/eslint-plugin` | 1.6.28 (peers `eslint >=8.57`, `typescript >=6` optional, `vitest *` optional) | none | ^1.6.28 |
| `syncpack` | 15.3.3 | ^15.3.1 | |

## 1. `webServer` with API + Vite

Facts (https://playwright.dev/docs/test-webserver, https://playwright.dev/docs/api/class-testconfig#test-config-web-server):

- `webServer` accepts an object or an **array**. Per entry: `command`, `cwd` (defaults to config dir), `env` (defaults to inheriting `process.env` plus `PLAYWRIGHT_TEST=1`), `url`, `name` (log prefix), `timeout` (default 60000), `reuseExistingServer`, `stdout` (default `ignore`), `stderr` (default `pipe`), `gracefulShutdown` (default: SIGKILL of the process group), `wait: { stdout?: RegExp, stderr?: RegExp }`.
- Readiness: `url` is ready on **2xx, 3xx (redirects followed), 400, 401, 402, 403**. If both `url` and `wait` are set, either one is enough.
- `reuseExistingServer: true` reuses whatever answers on `url`; `false` throws if something is already listening. Docs recommend `!process.env.CI`.
- `port` is deprecated, use `url`.
- **Startup order (from source, 1.64.1):** each `webServer` entry becomes a plugin; `createGlobalSetupTasks` runs `createRemoveOutputDirsTask`, then plugin setups, then `globalSetup` files, and the task runner awaits them **sequentially** (`for (const task of this._tasks)`). So array entries start one after another in array order, each waiting for readiness, **before** `globalSetup`; teardown is in reverse. Consequence: anything the API needs (Postgres up + migrated) must happen inside the API `command` or before Playwright starts, not in `globalSetup`.

Snippet for Colist (API first so Vite's proxy has a target):

```ts
import { defineConfig, devices } from '@playwright/test';

const WEB_PORT = 5010;  // not 5000, so a local `bun run dev` is never hit by mistake
const API_PORT = 5110;
const baseURL = `http://localhost:${WEB_PORT}`;

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'reports/test/',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: 'reports/html', open: 'never' }]]
    : [['html', { outputFolder: 'reports/html', open: 'never' }]],
  webServer: [
    {
      name: 'API',
      cwd: '../api',
      command: 'bun run test:e2e:serve', // compose up --wait, migrate, nest start
      url: `http://localhost:${API_PORT}/api/health`,
      env: { NODE_ENV: 'test', PORT: String(API_PORT), WEB_URL: baseURL },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    },
    {
      name: 'Web',
      command: `vite --port ${WEB_PORT} --strictPort`,
      url: baseURL,
      env: { API_URL: `http://localhost:${API_PORT}` },
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: { baseURL, trace: 'on-first-retry', serviceWorkers: 'block' },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
```

Colist-specific gaps found while reading the code:

- `apps/web/vite.config.ts` hardcodes the proxy target `http://localhost:5100`. It must become env driven, e.g. `const api = process.env.API_URL ?? 'http://localhost:5100'` for both `/api` and `/.well-known`.
- The API reads `.env.test` when `NODE_ENV=test` (`get-env-file-path.util.ts`). `@nestjs/config` lets real environment variables win over file values (https://docs.nestjs.com/techniques/configuration), so `webServer.env` can override `PORT` / `WEB_URL`.
- `.env.test` has no `WEB_URL`, so `trustedOrigins` falls back to `BETTER_AUTH_URL` (`:5301`). Browser requests come from the Vite origin, so `WEB_URL` must be set to the web origin (see section 2).
- voto-a-voto uses `trace: 'retry-with-trace'`; Playwright's types mark it `/** deprecated */` (alias of `on-first-retry`). Use `'on-first-retry'`.

## 2. Auth: `setup` project + `storageState` vs per-test API sign-up

Playwright (https://playwright.dev/docs/auth, https://playwright.dev/docs/test-global-setup-teardown):

- Project dependencies (a `setup` project) are the **recommended** way to do global setup over `globalSetup`: they show up in the HTML report, record traces, can use fixtures, and apply config like `headless`. If a dependency fails, dependent projects do not run.
- Basic pattern: `setup` project logs in once and writes `playwright/.auth/user.json`; test projects set `use.storageState` to it. Docs say to gitignore `playwright/.auth`.
- **"One account per parallel worker"** is the docs' **recommended** approach when tests **modify server-side state**: a worker-scoped fixture overrides `storageState`, keyed by `test.info().parallelIndex`, creating or acquiring a unique account per worker.
- **"Authenticate with API request"**: use `APIRequestContext` (e.g. `request.post(...)`) then `request.storageState({ path })`, either in the setup project or a worker fixture. https://playwright.dev/docs/api-testing shows `browser.newContext({ storageState })` from an API context's state.
- `browserContext.storageState()` returns cookies + localStorage; IndexedDB only with `{ indexedDB: true }` (1.51+), OPFS with `{ opfs: true }` (1.63+) (https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state).

Per-worker API sign-up fixture (Colist's API e2e already does real sign-up, `apps/api/test/helpers/sign-up.ts`):

```ts
// e2e/fixtures.ts
import { test as base } from '@playwright/test';
import { randomUUID } from 'node:crypto';

export const test = base.extend<object, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [
    async ({ playwright }, use, workerInfo) => {
      const baseURL = workerInfo.project.use.baseURL!;
      const request = await playwright.request.newContext({
        baseURL,
        extraHTTPHeaders: { Origin: baseURL },
      });
      await request.post('/api/auth/sign-up/email', {
        data: { name: 'E2E', email: `e2e-${randomUUID()}@test.local`, password: 'e2e-password-123' },
      });
      const file = workerInfo.project.outputDir + `/.auth/${workerInfo.parallelIndex}.json`;
      await request.storageState({ path: file });
      await request.dispose();
      await use(file);
    },
    { scope: 'worker' },
  ],
});
```

better-auth behind the Vite proxy (better-auth source: `packages/better-auth/src/api/middlewares/origin-check.ts`, `src/cookies/index.ts`):

- `validateOrigin` reads `Origin` (falling back to `Referer`). When the request **carries cookies** (or the endpoint forces validation) the origin must match `trustedOrigins`, else 403 `INVALID_ORIGIN`; a missing/`null` origin is 403 `MISSING_OR_NULL_ORIGIN`. Hence: set `WEB_URL` to the Vite origin, and send an explicit `Origin` header from Playwright `request` contexts (they do not add one).
- `Secure` flag: `advanced.useSecureCookies` override, else `baseURL` starting with `https://`, else `NODE_ENV === 'production'`. With `BETTER_AUTH_URL=http://localhost:...` and `NODE_ENV=test`, cookies are not `Secure` and have no `__Secure-` prefix, so they work over plain http. Cookies are HttpOnly, SameSite=Lax.
- Through the proxy the browser only sees `localhost:<web port>`. better-auth sets host-only cookies (no `Domain`), and cookies are not port scoped, so the session cookie is stored for `localhost` and sent on every `/api` call, including `new EventSource('/api/events', { withCredentials: true })` (same origin). Inference from cookie semantics (RFC 6265 section 8.5), not a better-auth doc statement.
- Sign up via the web origin (`baseURL` = Vite), not straight to the API port, so the saved cookie belongs to the origin the browser uses.

Tradeoff: voto-a-voto's UI login in `auth.setup.ts` against a fixed real account fits a read-only backend. Colist tests create lists/items (server state), so per-worker throwaway accounts on a throwaway DB match the docs' recommendation. Keep one UI-driven sign-in spec to cover the login form itself.

## 3. PWA service worker, SSE, IndexedDB

- **Service workers:** `page.route()` / `browserContext.route()` **do not intercept requests handled by a Service Worker**; docs recommend `serviceWorkers: 'block'` when using routing, and also when network events seem missing (https://playwright.dev/docs/network, https://playwright.dev/docs/api/class-page#page-route).
- **vite-plugin-pwa in dev:** the SW is only available in development with `devOptions.enabled: true` (https://vite-pwa-org.netlify.app/guide/development). Colist does not set it, and registration is the default `injectRegister: 'auto'` (https://vite-pwa-org.netlify.app/guide/register-service-worker). Against `vite` dev there is no SW. Against `vite preview` of a build there is, and `registerType: 'autoUpdate'` plus Workbox precache would serve stale assets across runs. Set `serviceWorkers: 'block'` anyway as a cheap guard; test the SW only in a dedicated spec, if ever.
- **Context isolation:** each test gets a fresh browser context, so IndexedDB (React Query persister via `idb-keyval`), localStorage and cookies start empty unless `storageState` seeds them. Since the default `storageState()` does **not** include IndexedDB, saved auth state holds only the session cookie, which is the right scope: no cached query data leaks between tests.
- **SSE / EventSource:** EventSource is a normal HTTP request that goes through the Vite proxy. `route.fulfill()` returns a whole body, so mocking a long-lived stream is a poor fit; test SSE end to end (two contexts, or a `request` call that mutates, then assert the other page updates through `expect(...).toBeVisible()` auto-retry). Inference from the route API, no dedicated Playwright SSE doc.
- **Offline:** `browserContext.setOffline(true)` exists for offline-queue specs (https://playwright.dev/docs/api/class-browsercontext#browser-context-set-offline).

## 4. GitHub Actions

From https://playwright.dev/docs/ci-intro and https://playwright.dev/docs/ci:

- Install browsers after deps: `npx playwright install --with-deps` (`--with-deps` also installs OS packages). Only Chromium is needed: `bunx playwright install --with-deps chromium`, run from `apps/web` so the local Playwright version is used.
- **Caching browsers is not recommended**: restore time is about the same as download, and Linux OS deps are not cacheable. If cached anyway, key on the Playwright version.
- Upload the report with `if: ${{ !cancelled() }}` so failures still upload. Docs sample: `retention-days: 30`.
- Recommended config for CI: `forbidOnly: !!process.env.CI`, `retries: process.env.CI ? 2 : 0`, `workers: process.env.CI ? 1 : undefined`.
- Sharding: not needed for a handful of specs, skip.

Step to add to `.github/workflows/test.yml` `test` job (after `bun install`):

```yaml
      - name: Install Playwright Chromium
        working-directory: apps/web
        run: bunx playwright install --with-deps chromium

      - name: E2E tests (web)
        run: bun run test:e2e -- --filter=web

      - name: Upload Playwright report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@<pin sha> # v5+
        with:
          name: playwright-report
          path: apps/web/reports/
          retention-days: 14
```

`ubuntu-latest` has Docker, which the API's `docker-compose.test.yml` already relies on.

**Conflict to resolve in ticket 03/05:** `bun run test:e2e` (turbo) runs `api` and `web` e2e in parallel. API Vitest `globalSetup` does `docker compose ... up` and its teardown does `down` on project `colist-api-test` (port 5300). If web e2e reuses that same compose project/port, the API run's teardown kills the DB under Playwright. Either give web e2e its own compose project name + port, or run the two sequentially.

## 5. Vitest 4 -> 5

From https://github.com/vitest-dev/vitest/blob/v5.1.0/docs/guide/migration/index.md (and `npm view`):

- Requires **Vite >= 6.4** and **Node >= 22.12** (engines `^22.12.0 || ^24.0.0 || >=26.0.0`). Colist: Vite 8, Node 24 via mise. OK.
- `vite` is now a **peer** dependency (Bun installs peers automatically).
- `clearMocks` defaults to **true** (history cleared before each test).
- **Inline projects inherit the root config by default** (`extends` defaults to `true`), including `plugins` and `resolve.alias`; arrays like `setupFiles` merge. voto-a-voto's `extends: true` on its storybook project is now redundant. Use `extends: false` for the old behavior.
- Inline projects **share one Vite server** by default (`sharedViteServer`).
- A referenced config file that declares `projects` now yields nested projects (was ignored).
- Unawaited `resolves` / `rejects` / `toMatchFileSnapshot` now **fail** the test (was a warning).
- `vi.mock` / hoisted calls must be at top level; class mocks keep prototype methods; `toThrow('')` matches any message; `expect.poll` fails on timeout; `test.sequential` / `describe.sequential` removed; worker ids 1-based.
- Config files are **no longer looked up in parent directories**.
- Reports/artifacts move to a single **`.vitest/`** dir; `json` / `junit` reporters write files instead of stdout.
- Removed entrypoints: `vitest/coverage`, `vitest/reporters`, `vitest/environments`, `vitest/snapshot`, `vitest/runners`, `vitest/suite`, `vitest/mocker`.
- `@vitest/coverage-v8@5.1.0` peers on `vitest: 5.1.0` exactly, so coverage and vitest move together in each package.

`projects` config for Colist web (no Storybook, so no browser project):

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      { test: { name: 'unit', include: ['src/**/*.spec.{ts,tsx}'], environment: 'node' } },
    ],
  },
});
```

A single project gives nothing over today's flat config. `projects` only earns its place if a second kind appears (for example a jsdom/browser component project). Keep the flat config. Its `include: ['src/**/*.spec.{ts,tsx}']` already keeps Vitest away from `e2e/*.spec.ts`, so Playwright specs can use the `.spec.ts` suffix safely.

**Lockstep with the API:**

- Not technically required: each workspace resolves its own `vitest`; web and API do not share test config.
- Enforced by repo convention: there is no syncpack config, so syncpack's **default Highest Semver version group** applies to every dependency: all packages must declare the same range (https://github.com/jamiemason/syncpack/blob/main/site/src/content/docs/version-groups.mdx). `bun run lint:deps` would flag web `^5` vs API `^4`, and `bun run fix:deps` would bump the API too. `lint:deps` is not wired into `bun run lint` or CI today, so nothing fails automatically.
- Dependabot's `vitest` group (`vitest`, `@vitest/*`, all update types) already bumps both workspaces in one PR.
- API impact of 5.x checked: no `vi.mock` / `vi.hoisted` in API; no unawaited `resolves`/`rejects` found; `vitest-mock-extended` peers `vitest >=4.0.0`; `unplugin-swc` has no vitest peer; API's `@vitest/coverage-v8` must bump to the same 5.x. `clearMocks` default and nested-project changes are the only plausible behavior changes; run the API suites after bumping.

## 6. ESLint flat config

`eslint-plugin-playwright` 2.12.2 (https://github.com/mskelton/eslint-plugin-playwright#usage): scope with `files`, extend `flat/recommended`.

```js
import playwright from 'eslint-plugin-playwright';

{
  files: ['e2e/**'],
  extends: [playwright.configs['flat/recommended']],
},
```

`@vitest/eslint-plugin` 1.6.28 (https://github.com/vitest-dev/eslint-plugin-vitest#usage): voto-a-voto spreads the preset object; README also shows the explicit form.

```js
import vitest from '@vitest/eslint-plugin';

{
  files: ['src/**/*.spec.{ts,tsx}'],
  ...vitest.configs.recommended,
},
// or explicit:
{
  files: ['src/**/*.spec.{ts,tsx}'],
  plugins: { vitest },
  rules: { ...vitest.configs.recommended.rules },
},
```

Colist web lint notes: `tsconfig.json` `include` is `["src", "*.config.ts"]`; with `projectService: true`, `e2e/**` must be added to `include` or type-aware rules error on those files. voto-a-voto needed `// eslint-disable-next-line @eslint-react/rules-of-hooks` for the fixture `use` callback; expect the same with `@eslint-react` strict, or disable that rule for `e2e/**`. Also add `e2e/**` (and `playwright.config.ts`) as knip entries, and gitignore `/playwright/.auth` (`/reports/` is already ignored at the root).

## Recommendations for Colist

1. `@playwright/test@^1.65.1` in `apps/web` devDependencies; `playwright.config.ts` as in section 1: two `webServer` entries (API first, health URL readiness, dedicated e2e ports, `reuseExistingServer: !CI`), `serviceWorkers: 'block'`, `trace: 'on-first-retry'`, CI `forbidOnly`/`retries`/`workers: 1`, reports under `reports/`.
2. Make the Vite proxy target env driven (`API_URL`), and pass `WEB_URL` to the API so better-auth trusts the Vite origin.
3. Auth: per-worker API sign-up fixture (`e2e/fixtures.ts`) over voto-a-voto's single shared UI login, since Colist tests mutate state; one spec drives the real sign-in form. Send `Origin` on `request` contexts. Do not save IndexedDB in storage state.
4. Test against `vite` dev (no SW), keep SW out of scope; test SSE end to end with two contexts, not by mocking.
5. CI: `bunx playwright install --with-deps chromium`, no browser cache, upload `apps/web/reports/` on `!cancelled()`, no sharding. Resolve the shared-Postgres teardown race with the API e2e (separate compose project/port or sequential runs).
6. Bump Vitest to `^5.1.0` in web **and** API together (plus API `@vitest/coverage-v8`), matching syncpack's default policy and the existing Dependabot group. Keep web's flat Vitest config; `projects` adds nothing with a single unit project.
7. ESLint: `eslint-plugin-playwright@^2.12.2` `flat/recommended` on `e2e/**`, `@vitest/eslint-plugin@^1.6.28` recommended on `src/**/*.spec.{ts,tsx}`; add `e2e` to `tsconfig` include and knip entries; gitignore `/playwright/.auth`.
