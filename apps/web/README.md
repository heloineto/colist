# Colist Web

Vite + React 19 SPA: TanStack Router (file routes in `src/app/routes`), Mantine, Tailwind 4, i18next (`src/shared/i18n`, `pt` is the source of truth), PWA via `vite-plugin-pwa`. Feature-Sliced Design enforced by `steiger`. Inherits root [`CLAUDE.md`](../../CLAUDE.md).

Dev server on `:5000` proxies `/api` to `:5100`. Production image = static `dist/` behind Caddy (`Caddyfile`), `VITE_APP_VERSION` baked at build (`APP_VERSION` build-arg, `dev` locally).
