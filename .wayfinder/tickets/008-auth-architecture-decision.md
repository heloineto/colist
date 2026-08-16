---
title: Auth architecture decision
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: [003-research-auth-without-supabase, 006-api-stack-decision]
---

## Question

Pick the Supabase Auth replacement and its shape: provider/library, session model (cookie vs bearer), where users live (API's Postgres?), and how the API validates tokens.

Carry-overs from vav worth keeping regardless: `TokenValidator` port with swappable adapters (prod vs e2e-jwt), auth error-code → pt-BR message lookup table.

Colist specifics to settle:
- Email+password now; password reset must actually ship this time; social login later?
- The `profiles` table + `createProfile` trigger pattern was Supabase-coupled — new user-creation flow.
- Mobile client token storage (SecureStore vs cookies) depending on the platform decision.
- Email delivery (reset/verification) — SES?
