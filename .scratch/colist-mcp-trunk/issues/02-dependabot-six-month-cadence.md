# Dependabot six-month cadence

Type: grilling
Status: resolved
Blocked by: 

## Question

How do we make Dependabot run every 6 months? Is there a native interval for it, what happens to security updates and cooldowns, and should all three ecosystems (bun, github-actions, docker) share the cadence?

## Answer

Decided AFK 2026-11-15. Source: [Dependabot options reference](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference): `schedule.interval: semiannually` is native and runs on **Jan 1 and Jul 1** (also `quarterly`, `yearly`, `cron`). Schedule and cooldown are version-updates only; security updates are not subject to cooldown.

**Decision:**
- All three ecosystems (`bun`, `github-actions`, `docker`) → `interval: semiannually`. One cadence = one upgrade sitting twice a year, worked with `/dependabot-upgrade`.
- Keep cooldowns as-is (cheap guard against grabbing a release published Dec 30).
- **Turn on Dependabot alerts + security updates** in repo settings (both are currently off: `vulnerability-alerts` 404, `automated-security-fixes` disabled). With a 6-month gap this is the safety net: security PRs open as soon as an advisory hits, independent of the schedule. The existing `security` groups already cover them.
- Add lockstep groups so a 6-month backlog arrives as few PRs, majors included: `nestjs` (`@nestjs/*`) and `vitest` (`vitest`, `@vitest/*`), `applies-to: version-updates`, all update types. Today's backlog shows why: 6 separate `@nestjs/*` PRs + 2 vitest PRs.
- `open-pull-requests-limit: 10` on bun stays.

Ships in the same PR as [Retire the dev branch](01-retire-dev-branch.md).
