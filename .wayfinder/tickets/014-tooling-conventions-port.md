---
title: Tooling and conventions port
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: []
---

## Question

Which of vav's repo-level machinery does colist adopt, and what's ceremony for a solo alpha project? Likely quick — default is "adopt wholesale", grill only the flagged items.

The base (adopt unless vetoed): mise + mise.lock toolchain; turborepo pipeline with root-level prettier/cspell outside turbo; umbrella script naming spec (CONTRIBUTING.md `lifecycle:check:target` grammar); husky guards (commit-msg commitlint ✅ already here; add branch guards — note vav *blocks* commits on dev but colist's flow commits to dev, so adapt, don't copy); eslint flat config `strictTypeChecked` + `max-lines: 300` + `max-depth: 3` + no-restricted-imports policy rules; knip; syncpack; cspell multi-language (colist already has this); docs/adr + CONTEXT-MAP/CONTEXT.md structure; Dependabot with cooldowns + SHA-pinned actions; `.env.<mode>.local` convention (create `.env.example` — vav's "ask a coworker" doesn't work solo).

Flag for grilling: `eslint-plugin-project-structure` for the API (worth it at colist's size?), steiger/FSD for the web/client (if one survives), jscpd, `packages/`-as-plain-folders convention vs real workspace packages.
