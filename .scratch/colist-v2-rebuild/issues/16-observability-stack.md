# Observability stack

Type: grilling
Status: open

## Question

What observability does colist v2 ship with, now that the [API stack decision](06-api-stack-decision.md) locked NestJS + pino (via vav's Logger port)?

- Error tracking: Sentry (user has claude.ai Sentry MCP connected) — API and/or client?
- Product analytics: PostHog was planned in the old code but never installed — in scope for parity, or dropped?
- Structured logging: pino comes with the vav port; decide log shipping/retention on AWS (CloudWatch? nothing?).
- Uptime/health checks, if any.

Keep it alpha-sized: decide what's worth wiring on day one vs later.
