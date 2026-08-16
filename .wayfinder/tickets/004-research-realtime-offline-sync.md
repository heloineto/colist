---
title: Research realtime + offline sync options
labels: [wayfinder:research]
status: closed
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

## Resolution

Full findings: [`.wayfinder/research/realtime-offline-sync.md`](../research/realtime-offline-sync.md).

- **Infra**: Caddy proxies WebSocket/SSE with zero config on the vav-style single instance; only edges are `stream_close_delay` (reloads) and `flush_interval -1` (SSE).
- **Sync engines 2026**: Electric (post-rewrite, Apache-2.0, read-path only, one Docker service) is the sanest; Zero 1.0 is new (RN client immature, needs zero-cache/CVR DBs); PowerSync most proven but heaviest (extra service, FSL license); TanStack DB alpha; Legend-State v3 beta. All add always-on infra a 7-table app doesn't need.
- **Middle ground**: TanStack Query `persistQueryClient` + `offlineFirst` + `setMutationDefaults` + `resumePausedMutations` is the documented first-party offline path; known pitfalls (mutations erroring instead of pausing, stuck queues) all have standard mitigations: NetInfo-wired onlineManager, idempotent UUID mutations, tolerate-deleted no-ops, last-write-wins on checked flags.
- **Precedents**: Bring!, AnyList, OSS list apps all ship server-authoritative LWW + client op queue + refresh nudge. Nobody uses CRDTs for shopping lists.

Research lean: no sync engine — refetch-on-focus/interval now, one SSE invalidation endpoint if push-style liveness is wanted, TanStack Query persistence + mutation queue for offline; Electric earmarked as the upgrade path. Final call belongs to the Realtime and offline strategy ticket.
