# Realtime and offline strategy

Type: grilling
Status: resolved
Blocked by: 04, 05

## Question

How much liveness and offline does colist v2 actually need, and what implements it?

Today: 3 Supabase Realtime subscriptions, all unfiltered ("any change anywhere wakes every user") and all just `refetch()`. No offline writes — the PWA shows a fallback page.

Grill:
- Is refetch-on-focus + short polling enough for a shared shopping list (ponytail floor), or is live presence-while-both-shopping a core experience?
- Offline: is add/check-while-offline a must (supermarket dead zones)? If yes, mutation queue vs a real sync engine — pull the research findings.
- Whatever is chosen must run on the vav-style single-instance infra (WS through Caddy is fine; a sync engine adds a service).

## Answer

Grilled 2026-08-23. No sync engine — the research lean confirmed wholesale.

1. **Liveness: one SSE endpoint** (NestJS `@Sse()`), coarse invalidation only — server pushes "list X changed", client runs `invalidateQueries`. No WebSockets, no interval polling.
2. **Stream shape: per-user single stream** (`GET /events`), server filters by Membership; also carries cross-list events (e.g. added to a list).
3. **Event bus: in-process `EventEmitter2`** on the single instance. `ponytail:` Postgres LISTEN/NOTIFY is the upgrade if instances ever multiply. SSE auth rides the session cookie (EventSource can't set headers) — constraint recorded on [Auth architecture decision](08-auth-architecture-decision.md).
4. **Presence: out.** No "partner is shopping now" — ever the WS pull, never the need.
5. **Offline reads: yes** — `persistQueryClient` (IDB) + app-shell service worker (vite-plugin-pwa); PWA opens and renders last-known lists with no network.
6. **Offline writes: content ops only** — Item add/edit/check/delete + Category ops queue via TanStack Query paused mutations (`offlineFirst`, `resumePausedMutations`). List lifecycle + Membership ops fail fast with an offline notice.
7. **Conflicts: last-write-wins by server arrival order**; mutations against deleted Items/Lists succeed as tolerant no-ops; new Items carry client-generated UUIDs for idempotent retries. Activities stamped with **server arrival time**, not client time.
8. **Reconnect: blanket invalidate** — on SSE (re)connect + `refetchOnReconnect`/`refetchOnWindowFocus`, refetch active queries. No `Last-Event-ID`, no server event log; the stream is stateless.

Inputs: [Research realtime + offline sync](04-research-realtime-offline-sync.md), coarse-invalidation requirement from [API stack decision](06-api-stack-decision.md).

## Comments

- 2026-08-16 (from [API stack decision](06-api-stack-decision.md) grilling): requirement sharpened — **coarse invalidation is enough**. When a shared list changes, the server just notifies "something changed on list X" and clients refetch; today's refetch mechanism "works wonders" and Supabase's fine-grained payloads were overkill. Also note stack is now locked to NestJS + Express 5, so pick the SSE/WS mechanism inside that.
