# Research auth without Supabase

Type: research
Status: resolved

## Question

Supabase Auth must go. Colist needs: email+password (today), password reset (built but disabled), sessions usable from a mobile client and possibly a web client, and a JWT (or equivalent) the API can validate — vav's API validates Supabase JWTs via a `TokenValidator` port, so the port pattern survives any choice.

Surface as of 2026:

- better-auth (maturity, Expo/React Native support, plugin ecosystem, self-hosting on the API's Postgres).
- Auth.js / others worth shortlisting; state of Lucia (deprecated?).
- AWS Cognito as the "already on AWS" option — DX cost, pricing.
- Rolling minimal JWT auth inside the API itself (NestJS or otherwise) — what's actually involved incl. reset emails (SES?).
- Email sending options on AWS for verification/reset.

Findings → `../research/auth-without-supabase.md`.

## Answer

Full findings: [`../research/auth-without-supabase.md`](../research/auth-without-supabase.md).

- The shortlist collapsed to **better-auth** (v1.6, 2026): tables in our own Postgres, email+password + reset built in, official Expo plugin (SecureStore), cookie + bearer/JWT session modes, documented NestJS integration, organization plugin. Lucia is deprecated (Mar 2025); the Auth.js team joined better-auth (Sep 2025) and recommends it for new projects.
- **Cognito**: free at colist scale but worst DX and cannot import password hashes (forced resets) — effectively ruled out.
- **Hand-rolled NestJS JWT**: ~1 week, viable via vav's TokenValidator port, but undifferentiated security code — fallback only.
- **Email**: SES, $0 at this volume; sandbox exit takes 1–3 days, request early. Resend free tier as fallback.
- **User migration**: Supabase bcrypt hashes export via pg_dump; better-auth supports custom bcrypt verify — users keep passwords.

Research lean: better-auth self-hosted inside the API + SES. Final call belongs to the Auth architecture decision ticket.
