# Run /setup-matt-pocock-skills

Type: task
Status: resolved

## Question

HITL task — only the user can do this: the skill is blocked from model invocation.

Run `/setup-matt-pocock-skills` in this repo with **local markdown tracker, default labels**. When done, note here whether the generated tracker doc's conventions differ from the interim ones this map uses (`.wayfinder/` layout described in `map.md`) and migrate if needed.

## Answer

Ran 2026-08-16. Wrote `docs/agents/{issue-tracker,triage-labels,domain}.md` (local markdown tracker in `.scratch/<effort>/`, default triage labels, single-context domain docs) and the `## Agent skills` block in `CLAUDE.md`. The interim `.wayfinder/` layout did differ from the canonical convention (frontmatter vs `Type:`/`Status:` lines, `tickets/NNN-` vs `issues/NN-`, effort unnamed) — this effort was migrated to `.scratch/colist-v2-rebuild/` in the canonical format.
