# Tooling and conventions port

Type: grilling
Status: resolved

## Question

Which of vav's repo-level machinery does colist adopt, and what's ceremony for a solo alpha project? Likely quick — default is "adopt wholesale", grill only the flagged items.

The base (adopt unless vetoed): mise + mise.lock toolchain; turborepo pipeline with root-level prettier/cspell outside turbo; umbrella script naming spec (CONTRIBUTING.md `lifecycle:check:target` grammar); husky guards (commit-msg commitlint ✅ already here; add branch guards — note vav *blocks* commits on dev but colist's flow commits to dev, so adapt, don't copy); eslint flat config `strictTypeChecked` + `max-lines: 300` + `max-depth: 3` + no-restricted-imports policy rules; knip; syncpack; cspell multi-language (colist already has this); docs/adr + CONTEXT-MAP/CONTEXT.md structure; Dependabot with cooldowns + SHA-pinned actions; `.env.<mode>.local` convention (create `.env.example` — vav's "ask a coworker" doesn't work solo).

Flag for grilling: `eslint-plugin-project-structure` for the API (worth it at colist's size?), steiger/FSD for the web/client (if one survives), jscpd, `packages/`-as-plain-folders convention vs real workspace packages.

## Answer

Resolved 2026-08-29 (grilling).

**Base adopted wholesale** (no vetoes): mise + `mise.lock`; turborepo pipeline with root-level prettier/cspell outside turbo; CONTRIBUTING.md `lifecycle:check:target` script grammar; eslint flat config `strictTypeChecked` + `max-lines: 300` + `max-depth: 3` + no-restricted-imports policy rules; knip; syncpack; cspell multi-language; docs/adr + single `CONTEXT.md`; Dependabot with cooldowns + SHA-pinned actions; `.env.<mode>.local` convention with a committed `.env.example`.

**Flagged items decided:**

- **`eslint-plugin-project-structure` (API)** — adopt vav's `project-structure.mjs` as-is (`folder-structure` + `independent-modules`). Copy-paste, not authored; delete rules if they fight.
- **FSD + steiger (web)** — adopt, same as vav web (`entities/pages/shared/...` layers, `steiger ./src` in the check pipeline).
- **jscpd** — adopt in both apps' check pipelines.
- **`packages/` convention** — plain folders inside each app (vav shape), **no workspace packages, no cross-app sharing at all**. Web consumes the API only through the orval-generated client. Shared needs are handled by copy-paste + diff between apps; hence **both apps must be organized identically** (same folder grammar, script names, lint config shape) so copy-paste updates stay easy.
- **Branch guards** — block commits and pushes to `main` only (dev is the working branch); keep `validate-branch-name`. Adapted from vav, which also blocks dev.
- **Pre-commit** — branch guard only; all checks run in CI (colist's currently-empty pre-commit gets vav's guard).
- **Domain docs** — stay single-context (`CONTEXT.md` at root); API lint-level module boundaries are not bounded contexts.

## Comments

- 2026-08-29: **local port range `5xxx`**, not vav's `4xxx` — both repos run on the same machine. Same layout shifted: `5000` web, `5050-5099` frontend services, `5100-5199` backend (API `5100`), `5200-5299` databases (Postgres `5200`), `5300-5399` testing. Prod container still listens on `3000` behind Caddy. Document in README `# Ports` like vav.
