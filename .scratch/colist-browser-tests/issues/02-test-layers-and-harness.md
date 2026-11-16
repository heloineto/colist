# Test layers and harness layout

Type: grilling
Status: resolved
Blocked by: 01

## Question

Which test layers does `apps/web` get (Vitest unit, Playwright e2e, Vitest browser/component?), where do files live, which configs and scripts exist, and how do lint, knip, steiger, tsconfig, cspell, gitignore and turbo learn about them, staying as close to voto-a-voto as Colist allows?

## Answer

Decided by the agent (user directive), overridable in `decisions.html`.

- **Two layers only.** Vitest unit (`src/**/*.spec.ts`, node env, the 4 existing specs) and Playwright Test e2e (`apps/web/e2e/`). No Vitest browser/component project: voto-a-voto has one only to run Storybook stories, and Colist has no stories. The e2e layer is what catches a broken Mantine/React bump.
- **Vitest 5.** Bump `vitest` (and API `@vitest/coverage-v8`) to `^5.1.0` in web and API together (syncpack default policy plus the Dependabot `vitest` group already assume lockstep). Keep the flat `vitest.config.ts`: `projects` buys nothing with a single unit project.
- **Playwright layout, mirroring voto-a-voto:** `playwright.config.ts` (`testDir: 'e2e'`, `outputDir: 'reports/test/'`, `webServer`, `reuseExistingServer: !CI`); `e2e/fixtures.ts` (`base.extend`, re-exports `expect`); `e2e/*.spec.ts`. Divergences: `trace: 'on-first-retry'` (voto's `retry-with-trace` is deprecated), `retries: CI ? 2 : 0`, `workers: CI ? 1 : undefined`, `forbidOnly: !!CI`, `use.locale: 'pt-BR'` (i18next detects `navigator`, so strings are deterministic Portuguese, like voto's specs), `serviceWorkers: 'block'`, and no `setup` project (auth is a worker fixture, see the E2E backend ticket).
- **Projects:** `Desktop Chrome` and `Mobile Chrome` (Pixel 7). Colist is a phone-first PWA whose navbar/drawer layout differs by breakpoint; both are Chromium, so one browser install.
- **Scripts (web):** `test` = `bun run test:unit && bun run test:e2e`, `test:unit` = `vitest run`, `test:e2e` = `playwright test`. Turbo `test:e2e` already exists with `cache: false`.
- **Wiring:** `eslint-plugin-playwright` `flat/recommended` on `e2e/**`; `@vitest/eslint-plugin` `configs.recommended` on `src/**/*.spec.ts`; tsconfig `include` adds `e2e`; knip `entry` adds `e2e/**` and `playwright.config.ts`; `apps/web/.gitignore` gets `/playwright/.auth` (root already ignores `/reports/`); cspell words as needed. Steiger lints only `./src`, no change. Specs import orval models from `@/shared/api/generated` for types, like voto does.
