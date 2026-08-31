# Observability stack

Type: grilling
Status: resolved

## Question

What observability does colist v2 ship with, now that the [API stack decision](06-api-stack-decision.md) locked NestJS + pino (via vav's Logger port)?

- Error tracking: Sentry (user has claude.ai Sentry MCP connected) — API and/or client?
- Product analytics: PostHog was planned in the old code but never installed — in scope for parity, or dropped?
- Structured logging: pino comes with the vav port; decide log shipping/retention on AWS (CloudWatch? nothing?).
- Uptime/health checks, if any.

Keep it alpha-sized: decide what's worth wiring on day one vs later.

## Comments

- 2026-08-23 ([Domain model v2](10-domain-model-v2.md)): Sentry ruled out entirely — user never adopted it; `errors` table stays as the error-capture mechanism. Remove the Sentry bullet from this ticket's options.

## Answer

Alpha-sized: nothing new to run, one endpoint to write.

- **Logs**: pino (vav Logger port, nestjs-pino, redaction, request ids) → `awslogs` → CloudWatch, 30-day retention — comes free with vav's `ecs` module. Unhandled API exceptions are logged there and **not** written to `errors`.
- **Client crashes → `errors` table**: React error boundary + `window.onerror` + `unhandledrejection` → `POST /errors`. Payload ships the error **code** + stack, never rendered i18n text. `error` jsonb is locked (zod DTO): `{ code?, name, message, stack, route, userAgent, appVersion }`, `appVersion` = git SHA baked at Vite build. User-submitted reports (the existing form) and `feedbacks` stay separate.
  - Endpoint is **public** (pre-login crashes matter); `user_id` from session when present, else NULL. Rate-limited per IP with `@nestjs/throttler` (new dependency, approved).
  - Client storm guard: in-memory dedup by `name+message+stack` hash, max 10 posts per page load.
  - Offline crashes are dropped — the mutation queue stays content-ops-only.
- **Health**: vav's static `/health` (no DB ping) for the ECS container healthcheck; EC2 auto-recovery alarm. A DB outage is not fixed by restarting the API.
- **Uptime/alerting**: none beyond auto-recovery. You use the app; you'll notice.
- **PostHog / product analytics**: dropped, ruled out of scope (not fog — a one-liner if it ever returns).
- **Client logging**: `console` only; `errors` is the client's only outbound telemetry.
- Sentry and staging stay out per Domain model v2 / Database hosting decision.
