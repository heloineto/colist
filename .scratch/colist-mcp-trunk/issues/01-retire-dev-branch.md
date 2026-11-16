# Retire the dev branch

Type: grilling
Status: resolved
Blocked by: 

## Question

What exactly changes to move from dev→main to trunk-based (feature branch → PR → main)? Cover: workflows triggers, iac plan triggers, branch-name validation, husky hooks/messages, docs (README/CONTRIBUTING/CLAUDE.md/memory), the 11 open Dependabot PRs on dev, branch protection, deleting the remote/local dev branch, and order of operations so nothing deploys by accident.

## Answer

Decided AFK 2026-11-15 (user directive). Facts: `dev` == `main` (no diverging commits); deploy trigger is already `main.yml` on `push: main`; bootstrap OIDC roles already have no `dev` subject (only `pull_request` + `refs/heads/main`); `main` protection already requires `Lint` + `Test`, `strict: true`.

**Model:** `main` is the only long-lived branch. Branch `<type>/<desc>` from `main` → PR to `main` → merge = deploy. No staging, no promotion.

**Changes (one PR, branch `chore/trunk-based`, targets `main`):**

| File | Change |
|---|---|
| `.github/workflows/test.yml` | `pull_request: branches: [main]`; drop `push: branches: [dev]` (no push trigger: strict protection already tested the merged tree) |
| `.github/workflows/iac.yml` | `pull_request: branches: [main]` |
| `.github/dependabot.yml` | remove all 3 `target-branch: dev` (default branch = `main`); cadence changes ride along, see [Dependabot six-month cadence](02-dependabot-six-month-cadence.md) |
| `package.json` `validate-branch-name` | pattern `^main$\|^(feat\|fix\|hotfix\|chore\|docs\|refactor\|ci\|test\|style)(\(.+\))?/.+$\|^dependabot/.+$` (drop `dev`) |
| `.husky/pre-commit` | message: "Work on a feature branch and open a PR." |
| `CONTRIBUTING.md` | one-line "Branching" note: branch from `main`, PR to `main`, merge deploys |

**Repo settings:** enable `delete_branch_on_merge` (feature branches are throwaway). Merge methods untouched. Protection unchanged.

**Order (nothing deploys by accident):** 1) merge the PR into `main` (deploys a no-op app change; acceptable). 2) close the 11 open Dependabot PRs on `dev` with a "dev retired" comment and delete their `dependabot/*/dev/*` branches. 3) delete `dev` on origin and locally (`git switch main`). 4) Insights → Dependency graph → Dependabot → "Check for updates" once per ecosystem, so pending upgrades (nestjs 12, vitest 5, ...) reopen against `main` now instead of on Jan 1.

**Not changed:** old `colist-v2-rebuild` map text ("work on dev") stays as history.
