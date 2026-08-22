# Auth architecture decision

Type: grilling
Status: open
Blocked by: 03, 06

## Question

Pick the Supabase Auth replacement and its shape: provider/library, session model (cookie vs bearer), where users live (API's Postgres?), and how the API validates tokens.

Carry-overs from vav worth keeping regardless: `TokenValidator` port with swappable adapters (prod vs e2e-jwt), auth error-code → pt-BR message lookup table.

Colist specifics to settle:
- Email+password now; password reset must actually ship this time; social login later?
- The `profiles` table + `createProfile` trigger pattern was Supabase-coupled — new user-creation flow.
- Mobile client token storage (SecureStore vs cookies) depending on the platform decision.
- Email delivery (reset/verification) — SES?

## Comments

- 2026-08-16 (from [API stack decision](06-api-stack-decision.md) grilling): user owns the official **NestJS Authentication & Authorization course** and wants its concepts applied when designing colist's auth. Subtitles at `/mnt/d/Courses/NestJS Courses/06 NestJS - Authentication and Authorization` (Windows: `D:\Courses\NestJS Courses\06 NestJS - Authentication and Authorization`). Subtitles confirmed ready 2026-08-16 — 20 lessons (`NN <title>.srt`) covering hashing, sign in/up, JWT + guards, public routes, active-user decorator, refresh tokens, token invalidation, RBAC, claims- and policy-based authorization, API keys, Google auth, 2FA, Passport sessions; plus `nestjs_1.pdf`. Read all subtitles when working this ticket. Weigh course-style NestJS auth against the research lean (better-auth self-hosted); that tension is this ticket's core call.
