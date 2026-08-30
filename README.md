# Colist

Shared shopping lists. Monorepo: `apps/api` (NestJS) + `apps/web` (Vite SPA).

## Installation

1. Install [mise](https://mise.jdx.dev/getting-started.html) and activate it in your shell
2. `mise install` at the repo root (bun, node, terraform at pinned versions)
3. Install [Docker](https://docs.docker.com/get-docker/)
4. `bun install`
5. Copy every `.env.example` to `.env.development.local` next to it (root, `apps/api`, `apps/web`)
6. `bun run start:services` then `bun run dev`

Before committing, run `bun run fix`. See [CONTRIBUTING.md](CONTRIBUTING.md) for script conventions.

## Ports

Local-dev only. Colist uses the `5xxx` range (voto-a-voto owns `4xxx`; both run on the same machine). Deployed containers listen on `3000`/`5100` behind Caddy on 80/443.

| Port Range | Service                     |
| ---------- | --------------------------- |
| 5000       | Web (Vite)                  |
| 5050-5099  | Frontend services           |
| 5100-5199  | Backend services (API 5100) |
| 5200-5299  | Databases (Postgres 5200)   |
| 5300-5399  | Testing (Postgres 5300)     |
