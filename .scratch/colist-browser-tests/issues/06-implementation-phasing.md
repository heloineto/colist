# Implementation phasing and handoff

Type: grilling
Status: resolved
Blocked by: 02, 03, 04, 05

## Question

How is the work cut into PRs and `/implement` tickets, in what order, and what is the definition of done?

## Answer

Decided by the agent (user directive), overridable in `decisions.html`.

- **PR 1 `chore/vitest-5`:** `vitest` + `@vitest/coverage-v8` to `^5.1.0` in web and API; fix fallout (`clearMocks` default, unawaited `resolves`/`rejects`). Green unit + API e2e. Small and isolated, so a Vitest regression is not tangled with Playwright.
- **PR 2 `test/web-e2e-harness`:** Playwright deps, `playwright.config.ts`, `e2e/fixtures.ts` (`account`, `secondUser`), API `start:e2e`, `API_URL` proxy, `WEB_URL`, lint/knip/tsconfig/gitignore/cspell wiring, `auth.spec.ts` as the first real spec, the `E2E (web)` CI job. User marks the check required after merge.
- **PR 3 `test/web-e2e-flows`:** `lists.spec.ts`, `items.spec.ts`, `sharing.spec.ts`.
- **Handoff:** `/implement` effort `colist-browser-tests-impl`, one ticket per PR, run in order (2 needs 1's Vitest only for consistency, 3 needs 2).
- **Done when:** from a clean machine state (no servers up) `bun run test` and `bun run lint` pass in `apps/web`; the CI job is green on PR 3; sanity check: temporarily breaking the item Checkbox `onChange` makes `items.spec.ts` fail.
