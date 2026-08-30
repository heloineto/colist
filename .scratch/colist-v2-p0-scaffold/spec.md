# P0 — Monorepo scaffold

Status: done
Source: [Implementation phasing § P0](../colist-v2-rebuild/issues/18-implementation-phasing.md) + tickets [13](../colist-v2-rebuild/issues/13-cicd-pipeline-design.md), [14](../colist-v2-rebuild/issues/14-tooling-conventions-port.md), [15](../colist-v2-rebuild/issues/15-i18n-mechanism.md).
Branch: `feat/p0-scaffold` → PR to `dev`. `main` untouched (frozen Next app; `legacy` tag + Vercel disconnect happen in P5).
Reference: `/home/heloi/programming/voto-a-voto` (read-only). Copy wholesale, delete what fights.

## Scope

### 1. Delete the Next.js app on `dev`

Remove `app/`, `components/`, `deprecated/`, `lib/`, `packages/` (empty dirs), `supabase/`, `public/sw.js`, `next.config.ts`, `proxy.ts`, `next-env.d.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`, root `eslint.config.mjs`, `.env.development`, `.env.production`, `.cursor/`, `scripts/setup-google-oauth.sh`? — **keep** `scripts/*.sh` (wizards, tickets 19/20), `docs/`, `CONTEXT.md`, `.scratch/`, `CLAUDE.md`, `apps/api/.env.development.local` (gitignored Google creds), `public/` icon set (moves to `apps/web/public`).

### 2. Root tooling (ticket 14 — vav verbatim unless noted)

- `mise.toml` (`bun`, `node 24`, `terraform 1.13`; no uv/supabase) + `mise.lock`.
- `package.json`: vav scripts minus `iac:*`/`lint:iac`/`fix:iac`/sandcastle (P1 adds iac), workspaces `apps/*`, devDeps (commitlint, cspell + pt/es dicts, husky, prettier + tailwind plugin, rimraf, syncpack, turbo, validate-branch-name, @types/bun). `packageManager` pinned.
- `turbo.json`, `prettier.config.mjs`, `.prettierignore`, `.npmrc`, `bunfig.toml`, `.gitattributes`, `.dockerignore`, `.gitignore` (vav shape), `cspell.json` (extract from current `package.json#cspell`, add words as lint demands), `.vscode/extensions.json`.
- `CONTRIBUTING.md` (script grammar, vav verbatim). `README.md`: ports `5xxx` (web 5000, api 5100, postgres 5200, test postgres 5300).
- `docker-compose.yml`: Postgres **17**, port `${POSTGRES_PORT}` from `.env.development.local`. Committed `.env.example` at root and per app (solo project; no coworker to ask).
- Husky: `commit-msg` (commitlint, exists), `pre-commit` = block `main` only + `validate-branch-name`, `pre-push` = block `main` only, `pre-merge-commit` = block `main` only. Branch pattern gains `|^dependabot/.+$` and `(\(.+\))?` scope.
- `.github/workflows/test.yml` vav verbatim (ticket 13). `dependabot.yml` waits for P1.
- Root `CLAUDE.md`: replace `check-types && lint` line with `bun run lint`.

### 3. `apps/api` — NestJS 11 + Express 5 skeleton

Copy from vav: `package.json` (drop typeorm/supabase/jwt/pg-copy-streams/tar/fishery/faker/clipboardy/scripts; add `drizzle-orm`, `drizzle-kit`, `pg`), `nest-cli.json`, `tsconfig*.json`, `eslint.config.mjs`, `project-structure.mjs` (as-is; `@packages/*` alias stays even if `packages/` is empty), `knip.config.ts`, `.jscpd.json`, `vitest.config.ts`, `test/vitest.config.e2e.ts` (single project — ticket 17 drops `sequential`), `test/global-setup.ts` (compose up/down + Drizzle `migrate()`, no seed), `docker-compose.test.yml` (Postgres 17, port 5300), `Dockerfile` (vav verbatim, installer stage), `README.md`, `packages/README.md`.
Source (`src/`): `main.ts`, `app.module.ts` (Core + Health; nestjs-zod pipe/interceptor + HttpExceptionFilter + LoggerErrorInterceptor as vav), `common/` (config with `ConfigSchema` = `PORT, MODE, LOG_LEVEL, DATABASE_URL, WEB_URL`; logger port + pino adapter + http options + specs; http-exception filter; `get-env-file-path.util`), `core/core.module.ts` (Config + Logger + **Drizzle** module: `pg.Pool(DATABASE_URL)` → `drizzle()` provider, `onModuleInit` runs `migrate({ migrationsFolder })`), `core/presentation/http/docs.setup.ts` (title "Colist API", no bearer, no filter tag), `health/` (static `{status:'ok'}`, no `@Auth` — IAM arrives in P2).
Drizzle: `drizzle.config.ts` (`schema: src/**/infrastructure/persistence/drizzle/schema.ts`, `out: migrations`), empty `migrations/` with `.gitkeep`-equivalent (Drizzle needs `meta/_journal.json`; run `drizzle-kit generate` once with an empty schema or commit an empty journal). Env: `.env.development.local` (git-ignored, exists with Google creds — append `MODE/PORT/DATABASE_URL/WEB_URL/LOG_LEVEL`), `.env.test` (committed, `DATABASE_URL` → localhost:5300), `.env.example`.
Tests: `test/health.e2e-spec.ts` (GET /health 200), keep vav `logger` unit specs.

### 4. `apps/web` — Vite + TanStack Router + Mantine + Tailwind 4

- `package.json`: scripts per grammar (`build`, `clean`, `dev` = `vite --port 5000`, `fix`, `lint` = types+code+fsd+unused, `lint:dry`, `test:unit` vitest), deps: react 19, `@tanstack/react-router` + `@tanstack/router-plugin`, `@mantine/core|hooks` (v9), `tailwindcss` + `@tailwindcss/vite`, `postcss-preset-mantine`, `postcss-simple-vars`, `tailwind-preset-mantine`, `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `vite-plugin-pwa`. Dev: eslint stack from vav web minus next/storybook/playwright (`@eslint-react`, `@tanstack/eslint-plugin-query` — wait for P4, skip; `@tanstack/eslint-plugin-router`), `steiger` + `@feature-sliced/steiger-plugin`, knip, jscpd, vitest, typescript.
- `vite.config.ts`: `tanstackRouter({ target:'react', autoCodeSplitting:true })`, `react()`, `tailwindcss()`, `VitePWA({ registerType:'autoUpdate', manifest: carried over from `public/manifest.json`(name "Colist"), icons from`public/` })`. `define`-free: `import.meta.env.VITE_APP_VERSION` read via `vite-env.d.ts`.
- FSD layout: `src/app/{main.tsx, routes/__root.tsx, routes/index.tsx, styles.css, providers.tsx}`, `src/pages/home/ui/home-page.tsx`, `src/shared/i18n/{index.ts, i18next.d.ts, locales/{pt,en,es}.ts}` (one key `hello`, `en/es` typed `satisfies typeof pt` shape per ticket 15), `src/shared/config/env.ts`?—skip, read `import.meta.env` inline. `steiger.config.mjs` vav verbatim, `steiger ./src`.
- Hello page: Mantine `Button` + `t('hello')` + language picker (`i18n.changeLanguage`) + `VITE_APP_VERSION`. Enough to prove every wire.
- `Caddyfile` (ticket 12): `colist.heloineto.com { handle /api/* { reverse_proxy localhost:5100 } handle { root * /srv; try_files {path} /index.html; file_server } }`.
- `Dockerfile` (ticket 13): `ARG BUN_VERSION`; stage `builder` = `oven/bun:${BUN_VERSION}-alpine`, `bun install --frozen-lockfile`, `ARG APP_VERSION=dev`, `ENV VITE_APP_VERSION=$APP_VERSION`, `bun run build --filter=web`; stage 2 `caddy:2-alpine`, `COPY --from=builder /app/apps/web/dist /srv`, `COPY apps/web/Caddyfile /etc/caddy/Caddyfile`.
- `.env.example`: `VITE_API_URL=http://localhost:5100` (unused until P4; documents the port).

## Out of scope

iac/, `main.yml`, `iac.yml`, `dependabot.yml`, `deploy-ecs.sh`, wizard (P1). Auth, schema, endpoints (P2). Any UI beyond hello (P4).

## Done

- `bun install` clean, `bun run lint` + `bun run test` green at root (== "`bun run check`").
- `docker build -f apps/api/Dockerfile .` and `docker build -f apps/web/Dockerfile .` succeed from repo root.
- `bun run dev` serves web on :5000, api on :5100 with `/health` → `{status:'ok'}` against compose Postgres :5200.

## Comments

- 2026-08-30: done in `4d90b0b` on `feat/p0-scaffold` (PR to `dev` pending). `bun run lint && bun run test` green; both images build; `colist-api:local` smoke-tested against compose Postgres (`/health` ok). Gotchas: vav's `apps/api/.swcrc` is a dotfile — without it `nest build` SIGABRTs (`base_dir must be absolute`); release image must `COPY` `migrations/` and `DrizzleModule` resolves it from `process.cwd()`. `bun run check` doesn't exist under the script grammar — gate is `bun run lint && bun run test`. Skipped for later phases: `dependabot.yml` (P1), postcss-preset-mantine / tailwind-preset-mantine and zod/query/router eslint plugins (P4).
