---
title: Research realtime + offline sync options
labels: [wayfinder:research]
status: open
assignee: claude
blocked-by: []
---

## Question

Supabase Realtime must go, and colist has zero offline support today (a shopping list app that dies in the supermarket's dead zone). Current behavior: 3 unfiltered realtime subscriptions that refetch everything. Surface as of 2026:

- Simple end of the spectrum: TanStack Query refetch-on-focus/interval, SSE, plain WebSockets (socket.io vs ws) — cost of running WS on a single ECS-on-EC2 box behind Caddy (vav's infra pattern).
- Sync-engine end: PowerSync, ElectricSQL, Zero (Rocicorp), TanStack DB, Legend-State — maturity, Postgres compat, self-host story, RN + web client support, whether they're overkill for a 7-table CRUD app.
- Offline-first middle ground: react-query persistence + mutation queue — real-world reliability for collaborative lists, conflict handling for check/uncheck + add/remove.
- What collaborative-list apps actually ship (precedents).

Findings → `.wayfinder/research/realtime-offline-sync.md`.
