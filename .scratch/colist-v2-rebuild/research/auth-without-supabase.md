# Research: Auth without Supabase

Ticket: `.wayfinder/tickets/003-research-auth-without-supabase.md` · Researched 2026-08-16

Needs: email+password today, password reset (built but disabled in v1), mobile (Expo/RN) and possibly web (Next.js PWA) clients, a token the API validates behind vav's existing `TokenValidator` port + `BearerGuard`.

## 1. better-auth (as of 2026)

- **Maturity**: v1.0 late 2024, v1.6 by May 2026. Widely used in production; became the de facto TS auth library after Lucia deprecated and the Auth.js team joined the better-auth project (Sept 2025). Main gap is enterprise SSO (SAML/SCIM) — irrelevant for Colist.
- **Postgres**: first-class. Point it at a connection string (Kysely under the hood) or use a Drizzle/Prisma adapter. Owns a handful of tables (`user`, `session`, `account`, `verification`) in your existing DB — CLI generates/migrates the schema.
- **Email+password & reset**: built in. `emailAndPassword: { enabled: true, sendResetPassword: async ({ user, url, token }) => ... }` — you supply the email-send function (SES fits directly); `revokeSessionsOnPasswordReset` and `onPasswordReset` hooks exist. Email verification similarly built in.
- **Expo/RN**: official `@better-auth/expo` plugin (server) + `@better-auth/expo/client`. Handles OAuth deep links and stores the session in `expo-secure-store`; sends it on requests automatically. Supports Expo native and web.
- **Cookie vs bearer**: default is cookie sessions (DB-backed, good for the web PWA). `bearer()` plugin issues the session token as an `Authorization: Bearer` header for non-cookie clients; there is also a `jwt()` plugin that exposes JWKS + signed JWTs if the API (or other services) want stateless verification. The Expo plugin already covers mobile without needing bearer.
- **NestJS**: officially documented integration via `@thallesp/nestjs-better-auth` — mounts the better-auth handler inside the Nest app (requires `bodyParser: false` on the auth route), ships an `AuthGuard`, session decorator, etc. So auth lives *inside* the API, one deployable, one Postgres.
- **Plugins**: large ecosystem — `organization` (orgs/teams/members/invitations, roles), `admin`, `two-factor`, `magic-link`, `passkey`, access control. The organization plugin maps well to "shared shopping lists between users" if list-sharing is modeled as org membership (may be overkill vs. a simple `list_member` table — sharing can stay app-domain).
- **Fit with vav port**: two options. (a) Keep `TokenValidator` and validate better-auth JWTs (jwt plugin, JWKS) — smallest change to vav architecture. (b) Simpler: use the integration's guard and swap `TokenValidator`'s implementation to call `auth.api.getSession({ headers })` — session lookup instead of JWT verify.

## 2. Other shortlist

- **Lucia**: **deprecated March 2025**. npm package carries the deprecation notice; the project is now a learning resource for hand-rolling sessions. Off the list.
- **Auth.js v5 (NextAuth)**: team joined better-auth in Sept 2025; Auth.js gets security patches only, better-auth is the recommended path for new projects — by its own maintainers. It was always Next.js-centric; Express support existed but second-class, and there's no NestJS story. Off the list.
- **Anything newer**: nothing credible has displaced better-auth for self-hosted TS. Managed options (Clerk, WorkOS) exist but reintroduce the vendor dependency Colist is escaping, plus per-MAU pricing.

## 3. AWS Cognito

- **Pricing**: restructured Dec 2024 into Lite/Essentials/Plus. Free tier cut from 50K → **10K MAU** (Lite/Essentials); new pools default to Essentials ($0.015/MAU past free tier). Fine for Colist's volume (free), but pricing is notoriously confusing and tier-locked.
- **DX in 2026**: still the weak point. Hosted UI ("managed login" branding refresh) is rigid and ugly-ish; custom UI means driving the SRP/`InitiateAuth` API flows via Amplify or `amazon-cognito-identity-js` — clunky in RN. Immutable pool attributes (can't change some settings after creation → recreate pool, migrate users). Error messages and docs are a known pain.
- **JWT validation**: this part is genuinely easy — standard OIDC JWTs, JWKS at a well-known URL, `aws-jwt-verify` lib; drops straight into vav's `TokenValidator` port.
- **Password reset/emails**: built-in, uses SES under the hood (still need SES production access for real volume).
- **Migration**: Cognito **cannot import password hashes**. User import (CSV) forces reset; the "lazy migration" Lambda trigger requires the old system to stay up to verify passwords at first login. Since Supabase is being shut off, that means forced resets for everyone.
- **Verdict**: cheap at this scale and "already on AWS", but worst DX of the options, hash import impossible, and Terraform + pool config busywork rivals just self-hosting.

## 4. Hand-rolled minimal JWT auth in NestJS

What vav already has: `TokenValidator` port (5 lines), `BearerGuard` (32 lines), and — notably — a working **`JwtTokenValidator`** (`apps/api/src/iam/infrastructure/jwt/`, 41 lines, `@nestjs/jwt` + zod claims schema, with spec). Token *validation* is already done.

What's missing is issuance and account lifecycle:

- signup/login endpoints, argon2id hashing (`argon2` npm) — ~1 day
- access JWT (short TTL) + refresh token rotation (hashed refresh tokens in Postgres, revocation, reuse detection) — 1–2 days
- password reset: single-use hashed token table, expiry, email send, reset endpoint — ~1 day
- email verification (same machinery) — ~0.5 day
- rate limiting on auth endpoints (`@nestjs/throttler`), lockout policy, tests — 1–2 days

**Honest estimate: ~1 week to solid, plus permanent ownership.** Risks: token-rotation edge cases (concurrent refresh), timing-safe comparisons, enumeration leaks in reset flow, session invalidation on password change — all the things better-auth already ships tested. It's tractable and the codebase is pre-shaped for it, but it's undifferentiated work: better-auth gives the same endpoints in ~1 day of integration and keeps the same guard/port shape.

## 5. Transactional email on AWS

- **SES**: $0.10/1,000 emails, no base fee — effectively **$0 at Colist volume** (3,000 free/mo for new accounts anyway). Setup: verify domain (DKIM CNAMEs via Route53/Terraform — trivial to automate), then **request sandbox exit** through the console (Service Quotas), 1–3 business days, must describe use case; occasionally denied on vague requests. Sandbox = can only send to verified addresses, 200/day.
- **Resend**: 3,000 free emails/mo, production from day one, nice DX/SDK, React Email templates. Paid starts $20/mo. Zero-friction option if SES approval annoys.
- **Postmark**: best deliverability reputation, $15/mo minimum — not worth a base fee at tiny volume.
- **Verdict**: SES — already on AWS, Terraform-able, free at this scale. Sandbox exit is the only friction (do it early). Resend free tier is the fallback/dev option.

## 6. Migrating existing Supabase Auth users

- Hashes are **exportable**: `auth.users.encrypted_password` is bcrypt; readable via direct Postgres (`select * from auth.users`) or `pg_dump` — no support ticket needed with DB access (hosted Supabase: contact support only if you lack direct access).
- **better-auth**: official Supabase migration guide. Default hasher is scrypt, but `password: { hash, verify }` is overridable — plug in `bcrypt.compare` (or verify-bcrypt-then-rehash-to-scrypt on first login). Users keep their passwords. Known gotcha (GH #4762): must set the custom verify before users log in, or logins fail.
- **Hand-rolled**: trivially — copy the bcrypt hash column, verify with bcrypt, optionally rehash to argon2 on first successful login.
- **Cognito**: **no hash import**, forced resets (or a lazy-migration Lambda that needs Supabase still running). Worst migration story.

## Sources

- [better-auth Supabase migration guide](https://better-auth.com/docs/guides/supabase-migration-guide) · [Expo integration](https://better-auth.com/docs/integrations/expo) · [NestJS integration](https://better-auth.com/docs/integrations/nestjs) · [thallesp/nestjs-better-auth](https://github.com/thallesp/nestjs-better-auth)
- better-auth docs via context7 (email-password, sendResetPassword, expo plugin, organization plugin)
- [Better Auth vs Clerk vs NextAuth vs Supabase Auth (makerkit, 2026)](https://makerkit.dev/blog/tutorials/better-auth-vs-clerk) · [Self-hosted NodeJS auth in 2026 (dev.to)](https://dev.to/noorix1/self-hosted-nodejs-authentication-in-2026-9ao) · [RN auth with Better Auth (LogRocket)](https://blog.logrocket.com/react-native-authentication-with-better-auth-and-expo/)
- [Lucia Auth is Dead (wisp)](https://www.wisp.blog/blog/lucia-auth-is-dead-whats-next-for-auth) · [lucia-auth/lucia](https://github.com/lucia-auth/lucia) · [Auth.js → Better Auth switch write-up](https://dev.to/pipipi-dev/nextauthjs-to-better-auth-why-i-switched-auth-libraries-31h3)
- [Cognito pricing (AWS)](https://aws.amazon.com/cognito/pricing/) · [The Stack on new Cognito pricing](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/) · [Frontegg Cognito pricing guide](https://frontegg.com/guides/aws-cognito-pricing)
- [Resend vs SES vs Postmark 2026](https://www.buildmvpfast.com/blog/resend-vs-ses-vs-postmark-transactional-email-deliverability-saas-2026) · [SES review 2026](https://mailflowauthority.com/esp-reviews/aws-ses-review)
- [Supabase export users discussion](https://github.com/orgs/supabase/discussions/3897) · [better-auth discussion #2520](https://github.com/better-auth/better-auth/discussions/2520) · [better-auth issue #4762 (bcrypt gotcha)](https://github.com/better-auth/better-auth/issues/4762)
- vav reference code: `voto-a-voto/apps/api/src/iam/` (`token-validator.port.ts`, `jwt-token-validator.ts`, `bearer.guard.ts`)

## Implications for the decision

- Lucia is dead and Auth.js's own team points new projects at better-auth — the "library" shortlist has collapsed to one credible entry.
- Every Colist requirement (email+password, reset, Expo client, web client, own Postgres, in-process with NestJS) is a documented better-auth feature, including the exact Supabase migration path with bcrypt hashes preserved.
- Cognito is free at this scale but has the worst DX, no hash import (forced resets for existing users), and its only real advantage — easy JWT validation — is matched by better-auth's jwt plugin or session API.
- Hand-rolling is viable (~1 week; vav already has the guard/port and even a JwtTokenValidator) but is undifferentiated security-sensitive code you then own forever; better-auth reaches the same endpoint in ~1 day.
- Email: SES regardless of auth choice — request sandbox exit early; Resend free tier as dev/fallback.
- vav's `TokenValidator` port survives all options; with better-auth it becomes either a JWKS validator (jwt plugin) or a thin `auth.api.getSession` wrapper.

## Recommendation lean

**better-auth, self-hosted inside the NestJS API on the app's Postgres, with the Expo plugin for mobile and cookie sessions for web; SES for reset/verification emails; migrate Supabase users by importing bcrypt hashes with a custom verify (rehash on first login).** Fallback if better-auth disappoints in practice: hand-rolled JWT auth — the codebase is already shaped for it and nothing about choosing better-auth forecloses it.
