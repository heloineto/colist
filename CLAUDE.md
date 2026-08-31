## Global

- ALWAYS be extremely concise. Sacrifice grammar for the sake of concision

## Programming

- ALWAYS write clean and elegant code
- NEVER nest code beyond 3 levels deep. Always refactor using:
  - Early return to kill conditions fast, invert guards
  - Extract nested blocks into separate functions
- NEVER use single-character variable names. BAD: `i` GOOD: `index`

### TypeScript

- ALWAYS run `bun run lint` after making changes
- BAD: `==` or `!=`. GOOD: `===` or `!==`
- BAD: `Array<number>` GOOD: `number[]`

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<effort>/`, one named directory per effort. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
