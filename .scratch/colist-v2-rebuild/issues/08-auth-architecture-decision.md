# Auth architecture decision

Type: grilling
Status: resolved
Blocked by: 03, 06

## Question

Pick the Supabase Auth replacement and its shape: provider/library, session model (cookie vs bearer), where users live (API's Postgres?), and how the API validates tokens.

Carry-overs from vav worth keeping regardless: `TokenValidator` port with swappable adapters (prod vs e2e-jwt), auth error-code → pt-BR message lookup table.

Colist specifics to settle:
- Email+password now; password reset must actually ship this time; social login later?
- The `profiles` table + `createProfile` trigger pattern was Supabase-coupled — new user-creation flow.
- Mobile client token storage (SecureStore vs cookies) depending on the platform decision.
- Email delivery (reset/verification) — SES?

## Answer

Grilled 2026-08-23, two rounds + Passport clarification. Course subtitles (20 lessons) digested by subagent and weighed.

**Core call: hybrid.** better-auth (v1.6) is the auth *provider*; the course's API-side architecture is what colist ports. Passport is not used — it's credential-verification plumbing better-auth already contains (course itself avoided it for 19/20 lessons).

- **Provider**: better-auth mounted inside the NestJS API (Express handler at `/api/auth/*`), same process, same Postgres. Tables `user/session/account/verification` as locked in [Domain model v2](10-domain-model-v2.md).
- **Session model: cookie sessions** — httpOnly secure cookie, session rows in Postgres, per-request lookup. No JWT, no refresh rotation, **no Redis** (the course's L12 invalidation apparatus is consciously unused — revocation is a row delete). Same-origin PWA behind Caddy makes cookies the native fit; better-auth's Expo plugin adds bearer mode later if a native app ever exists.
- **Course patterns ported into the API**: global `APP_GUARD` default-protect, `AuthenticationGuard` composing an `AuthType → guard` map, `@Auth(AuthType.None)` public opt-out, `@ActiveUser` + `REQUEST_USER_KEY`, abstract-provider pattern. vav's `TokenValidator` port survives with a **single prod adapter** (better-auth session resolution).
- **No email infra at all** — no SES, no verification, no reset emails. The ticket's "reset must ship" requirement is **consciously relaxed**: forgot password → WhatsApp the maintainer → manual hash reset (psql/one-liner). SES + better-auth reset flow is a config-level enable if colist goes public.
- **Google login IN** (better-auth social provider — not the course's manual `google-auth-library` flow). Auto-link by verified email (`accountLinking.trustedProviders: ['google']`). New users get **both** password and Google sign-up.
- **Scope cuts**: 2FA, API keys, global RBAC — out. Colist's only roles are per-list owner/member: implemented course-style (guards + decorators) against `memberships`, in the API, not the auth layer.
- **Carry-overs**: auth error-code → pt-BR lookup kept (mapped to better-auth error codes). vav's `e2e-jwt` adapter **dropped** — e2e tests sign in for real against test Postgres (detail → [API test & seed strategy](17-api-test-seed-strategy.md)).
- **Migration**: Supabase bcrypt hashes import via better-auth custom verify — users keep passwords (mechanics → [Data migration cutover](11-data-migration-cutover.md)).
- New HITL task: [Google OAuth credentials](19-google-oauth-credentials.md) (GCP console setup).

## Comments

- 2026-08-16 (from [API stack decision](06-api-stack-decision.md) grilling): user owns the official **NestJS Authentication & Authorization course** and wants its concepts applied when designing colist's auth. Subtitles at `/mnt/d/Courses/NestJS Courses/06 NestJS - Authentication and Authorization` (Windows: `D:\Courses\NestJS Courses\06 NestJS - Authentication and Authorization`). Subtitles confirmed ready 2026-08-16 — 20 lessons (`NN <title>.srt`) covering hashing, sign in/up, JWT + guards, public routes, active-user decorator, refresh tokens, token invalidation, RBAC, claims- and policy-based authorization, API keys, Google auth, 2FA, Passport sessions; plus `nestjs_1.pdf`. Read all subtitles when working this ticket. Weigh course-style NestJS auth against the research lean (better-auth self-hosted); that tension is this ticket's core call.

- 2026-08-23 (from [Realtime and offline strategy](09-realtime-offline-strategy.md)): constraint — the SSE liveness endpoint authenticates via **session cookie** (EventSource can't set headers), so whatever auth lands here must issue cookie-based sessions for the SPA, not header-only bearer tokens.
