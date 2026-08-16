---
title: Research auth without Supabase
labels: [wayfinder:research]
status: open
assignee: claude
blocked-by: []
---

## Question

Supabase Auth must go. Colist needs: email+password (today), password reset (built but disabled), sessions usable from a mobile client and possibly a web client, and a JWT (or equivalent) the API can validate — vav's API validates Supabase JWTs via a `TokenValidator` port, so the port pattern survives any choice.

Surface as of 2026:

- better-auth (maturity, Expo/React Native support, plugin ecosystem, self-hosting on the API's Postgres).
- Auth.js / others worth shortlisting; state of Lucia (deprecated?).
- AWS Cognito as the "already on AWS" option — DX cost, pricing.
- Rolling minimal JWT auth inside the API itself (NestJS or otherwise) — what's actually involved incl. reset emails (SES?).
- Email sending options on AWS for verification/reset.

Findings → `.wayfinder/research/auth-without-supabase.md`.
