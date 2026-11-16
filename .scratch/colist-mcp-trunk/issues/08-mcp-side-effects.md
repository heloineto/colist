# MCP side effects: activities, realtime, throttling

Type: grilling
Status: resolved
Blocked by: 05

## Question

Do MCP-made changes record Activities and trigger SSE invalidation like the web app, should they be marked as done via Claude, and what rate limiting applies to the MCP endpoint?

## Answer

Decided AFK 2026-11-15.

- **Activities: yes, automatically.** Tools call the same use-cases, which record Activities with the user as actor. Claude acts *as* the user, so history reads "Heloi added Leite". **No "via Claude" marker** for now (would need an `activities` column + 3 locales of copy for little value at ~47 users). Overridable.
- **Realtime: yes, free.** `ActivityRecorder` emits the list-changed event, so open web clients of every Member refresh via SSE while Claude edits.
- **Throttling: none on `/api/mcp`.** `@nestjs/throttler` is IP-keyed and all Claude traffic comes from Anthropic's shared ranges (`160.79.104.0/21`, `153.61.208.0/20`), so an IP throttle would pool every user into one bucket. Bulk tools are capped at 50 entries per call; auth is required. If abuse ever shows up, add a throttler keyed on `claims.sub`. Same caveat for better-auth's built-in IP rate limit on `/oauth2/token`: fine at this scale, raise it if 429s show up in logs.
- **Logging:** one pino line per tool call (tool, userId, listId, ok/error), no item text.
