# Realtime + offline sync options (research, 2026-08)

Ticket: `.wayfinder/tickets/004-research-realtime-offline-sync.md`
Context: colist v2 — 7 Postgres tables, own TS API on a single ECS-on-EC2 box behind Caddy, client Expo/RN or Next.js PWA with TanStack Query. Replacing Supabase Realtime; adding offline tolerance for supermarket dead zones.

---

## 1. Simple tier: polling, SSE, WebSockets

### TanStack Query refetchOnWindowFocus + refetchInterval

- This is the default, boring pattern and it's widely shipped. TanStack Query's `staleTime: 0` default already refetches on mount/focus/reconnect; adding `refetchInterval` (e.g. 5–15s while a list screen is open) covers the "partner checked off milk" case with seconds of latency. TkDodo (Query maintainer) explicitly frames refetch-on-focus/reconnect as overlapping with what people reach to WebSockets for ([Using WebSockets with React Query](https://tkdodo.eu/blog/using-web-sockets-with-react-query)).
- For a 2-to-few-person shared list, a 5–10s poll on the *open* list is invisible to users and costs almost nothing at colist's scale (a handful of households → tens of requests/min worst case).
- Caveats: `refetchOnWindowFocus` is a web concept; in Expo/RN you wire it to `AppState` + `focusManager` (documented pattern). `refetchInterval` pauses when the app is backgrounded — which is what you want.

### SSE vs WebSocket (from a Node/NestJS API)

- If the only realtime need is "server tells clients: something changed, invalidate", the payload is one-directional → **SSE wins on simplicity**: plain HTTP, native `EventSource` auto-reconnect with `Last-Event-ID`, no upgrade handshake, works through every proxy/CDN without special config ([Ably: WebSockets vs SSE 2026](https://ably.com/blog/websockets-vs-sse), [SSE production guide](https://www.hirenodejs.com/blog/nodejs-server-sent-events-sse-2026)). NestJS has first-class `@Sse()` support.
- The classic tiny-invalidation-event pattern (server pushes `{entity: ["lists", id]}`, client calls `queryClient.invalidateQueries`) is TkDodo's recommended realtime integration and works identically over SSE or WS ([source](https://tkdodo.eu/blog/using-web-sockets-with-react-query)).
- SSE caveats: browser limit of ~6 concurrent SSE connections per domain over HTTP/1.1 (fine over HTTP/2, which Caddy speaks by default); RN has no native `EventSource` (needs `react-native-sse` polyfill). WS caveat: hand-rolled reconnect/heartbeat logic.

### socket.io vs native ws (2026)

- `ws`: bare, 3–5x faster raw throughput, no protocol overhead, no sticky-session concerns; you write reconnect/rooms/heartbeats yourself ([PkgPulse 2026 comparison](https://www.pkgpulse.com/guides/socketio-vs-ws-vs-uwebsockets-websocket-servers-nodejs-2026)).
- socket.io: rooms, auto-reconnect, ack, fallback transports; needs sticky sessions behind a multi-node LB (irrelevant on one box). Consensus for collaborative/room-style apps on a single node: socket.io's conveniences outweigh overhead; for pure fan-out of invalidation pings, `ws` or SSE is enough ([DEV production comparison](https://dev.to/axiom_agent/nodejs-websockets-in-production-socketio-vs-ws-scaling-and-reconnection-strategies-5b68)).
- For colist there are no rooms beyond "list id" and no client→server traffic that isn't a normal HTTP mutation → socket.io buys little.

### WS/SSE through Caddy on a single instance

- **Confirmed: no configuration needed.** Caddy's `reverse_proxy` detects the Upgrade handshake and switches to a bidirectional tunnel automatically ([Caddy docs](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy)).
- Known sharp edges, all minor and documented:
  - Config reload kills active WS connections unless `stream_close_delay` is set (e.g. `5m`) ([caddy#6420](https://github.com/caddyserver/caddy/issues/6420)).
  - For SSE, set `flush_interval -1` to disable response buffering ([caddy#4247 workaround repo](https://github.com/leafac/caddy-express-sse)).
  - Scattered reports of long-lived connection drops ([caddy#6958](https://github.com/caddyserver/caddy/issues/6958) — closed "not planned", evidence pointed at environment, not a Caddy bug; the fix in the wild is app-level heartbeat + reconnect, which you need anyway on mobile networks).
- ECS-on-EC2 single instance: no ALB in the path per the infra pattern, so no ALB idle-timeout concern. If an ALB is ever added, its default 60s idle timeout is the thing to bump/heartbeat past.

---

## 2. Sync engines, state of 2026

| | Postgres | Self-host | RN + web | License/pricing | Maturity | Fit for 7-table CRUD |
|---|---|---|---|---|---|---|
| **Electric** | Native (logical replication) | 1 Elixir/Docker service | Web yes; RN via TanStack DB adapters | Apache-2.0, free self-host | Post-rewrite, stable, prod users | Best of the engines, still +1 service |
| **PowerSync** | Native | Service + Mongo/Postgres bucket storage | Yes, mature both | FSL (source-available), free Open Edition | Prod-grade, oldest | Solid but heaviest infra |
| **Zero** | Native (needs PG ≥15, logical repl) | zero-cache + CVR/change DBs | Web mature; RN new (0.23) | Free, self-host | 1.0 Jun 2026 | Powerful, most moving parts |
| **TanStack DB** | Via Electric/Query collections | n/a (client lib) | Yes (0.6: Expo SQLite persistence) | MIT | **Alpha/0.x** | Attractive later; not stable yet |
| **Legend-State v3** | No server piece; you write CRUD plugin | n/a (client lib) | Yes | MIT | **Still beta** | Light, but beta + DIY backend glue |

Details:

- **Electric (post-rewrite ElectricSQL)** — 2024 rewrite abandoned the CRDT local-first framework; now a **read-path-only** HTTP sync engine: an Elixir service between Postgres (logical replication required) and clients, streaming partial-replication "shapes" over HTTP (CDN-friendly). **Writes go through your own API** — you keep normal NestJS mutations. Self-host: one Docker container + `DATABASE_URL` ([repo](https://github.com/electric-sql/electric), [PGlite/Electric sync docs](https://pglite.dev/docs/sync)). Apache-2.0, self-hosting free; Electric Cloud is the paid path. Production users exist (Trigger.dev, Otto among publicized ones). Honest fit: the sanest of the engines for this stack because writes stay yours, but it's still an extra always-on service and its offline story on RN routes through TanStack DB (alpha).
- **PowerSync** — server-side PowerSync Service replicates Postgres → per-client SQLite (real SQLite on RN, WASM on web). Mature RN/Expo and web SDKs ([docs](https://docs.powersync.com/client-sdks/reference/react-native-and-expo)). Self-host "Open Edition" is free under FSL (converts to open source after 2 years) ([open-source page](https://powersync.com/open-source)); enterprise self-host is paid. Extra infra: the service **plus** bucket storage — MongoDB by default, Postgres bucket storage now available but Beta ([announcement](https://releases.powersync.com/announcements/introducing-postgres-for-sync-bucket-storage)). Writes: you implement an `uploadData` hook hitting your API (server-authoritative, LWW by default). Honest fit: the most production-proven full offline-first option, but 1–2 extra services on a single-box deployment for a 7-table app is real weight.
- **Zero (Rocicorp)** — client-side partial sync with queries ("synced queries"), optimistic writes with server-authoritative rebase via custom mutators. **1.0 shipped June 2026** ([InfoQ](https://www.infoq.com/news/2026/06/zero-version-1/)); powers zbugs. RN/Expo support only landed at 0.23, young. Self-host: deploy `zero-cache` + Postgres ≥15 with logical replication + separate CVR/change DBs (can be schemas on the same PG) ([self-host docs](https://zero.rocicorp.dev/docs/self-host)). Free to self-host. Honest fit: technically the most elegant, but the most infra/concepts (permissions language, zero-cache ops) and the RN client is the newest part — overkill for 7 tables.
- **TanStack DB** — client store (differential dataflow, sub-ms live queries) over collections backed by TanStack Query, Electric, PowerSync, or TrailBase. 0.6 (June 2026) added SQLite persistence incl. Expo and offline support ([blog](https://tanstack.com/blog/tanstack-db-0.6-app-ready-with-persistence-and-includes)). **Explicitly alpha** ([overview](https://tanstack.com/db/latest/docs/overview)). Honest fit: this is the likely *future* upgrade path from plain TanStack Query (same team, incremental adoption), but betting v2 on an alpha contradicts "simplest thing that works".
- **Legend-State v3** — signal state lib with persist+sync plugins (`syncedCrud`); optimistic-local, retry-until-synced. **v3 still in beta** ([site](https://legendapp.com/open-source/state/v3/)); no Postgres server component — you'd write the CRUD plugin against your API, i.e. it's a nicer mutation queue, not a sync engine. Docs/plugin rough edges reported ([#405](https://github.com/LegendApp/legend-state/issues/405)). Honest fit: would replace TanStack Query wholesale for marginal gain; beta risk.

---

## 3. Middle ground: TanStack Query persistence + offline mutation queue

Pattern ([official docs](https://tanstack.com/query/latest/docs/framework/react/guides/mutations)): `persistQueryClient` (AsyncStorage/localStorage persister) for cached reads offline + `networkMode: 'offlineFirst'` + paused mutations resumed via `resumePausedMutations()` in `PersistQueryClientProvider.onSuccess`. Because functions don't serialize, **every offline-capable mutation needs `setMutationDefaults(key, { mutationFn })`** so resumed mutations after restart have a function to run.

### Reliability in the wild

Works, and is the documented first-party path, but it's a mutation *queue*, not a sync engine. Known failure modes (all with GitHub receipts):

- Mutations erroring instead of pausing when connectivity flaps mid-flight ([#4170](https://github.com/TanStack/query/issues/4170)) — mitigate by wiring `onlineManager` to NetInfo (RN) / navigator events explicitly.
- Resume-after-reconnect regressions/stuck states ([#5847](https://github.com/TanStack/query/issues/5847)); one failing mutation can leave later ones paused ([#6825](https://github.com/TanStack/query/issues/6825)) — mutations resume serially; give queued mutations retry + idempotency.
- "No mutationFn found" after hydration if defaults weren't registered before resume ([discussion #5248](https://github.com/TanStack/query/discussions/5248)).
- Persisted optimistic cache can be stale-restored over fresher data — set `maxAge`/`buster` sensibly; treat restored cache as display-only until first refetch.

### Conflict handling for a list app

Colist's domain makes conflicts cheap:

- **Checked flag**: LWW is semantically fine — two people checking the same item want the same outcome; check-then-uncheck races resolve to *someone's* intent and are self-correcting on next glance. Optionally send `checked_at` client timestamp and let server keep max — but plain LWW at the server is acceptable.
- **Add**: client-generated UUIDs make adds idempotent and race-free (two adds = two rows; dedupe by name at UI level if desired).
- **Delete vs edit race**: make mutations tolerant — `UPDATE ... WHERE id=?` affecting 0 rows is a success (item was deleted; treat as no-op), or use soft delete. Never 404-fail a queued check on a deleted item, or the queue jams (see #6825).
- General rule: queued mutations must be **idempotent, order-tolerant, and unable to hard-fail** — map 4xx to "drop silently + refetch".

Pitfall summary: fine for *short* offline windows (the dead-zone-in-aisle-7 case); gets hairy if you promise days-offline multi-device editing — that's when a real sync engine earns its keep.

---

## 4. Precedents: what collaborative list apps ship

Little is published by the commercial apps (no AnyList/Bring engineering blogs found), but the observable/known pattern is consistent:

- **Bring!**: server-authoritative REST + push notifications to nudge refetch; list state is effectively LWW per item. No CRDTs. Works offline read-only-ish with queued ops.
- **AnyList**: local store on device, background sync, per-field LWW; marketing has long claimed "works offline, syncs when back" — i.e., mutation queue + server merge, not OT/CRDT.
- **Google Keep**: full sync-engine treatment (Google infra, per-node merge) — the exception that proves the rule; nobody self-hosting replicates this for a shopping list.
- **Open-source shopping lists** converge on the same two shapes: (a) PouchDB/CouchDB replication (IBM's [offline-first shopping list demo](https://github.com/ibm-watson-data-lab/shopping-list-vanillajs-pouchdb), [Nextcloud shopping list](https://shoppinglist.otherworld.dev/) — offline-first Android + LWW) or (b) plain REST + WebSocket refresh ([our-shopping-list](https://github.com/nanawel/our-shopping-list): Vue + Node, socket refresh, no offline queue).
- Industry guidance for exactly this app class: local-first writes, operation queue with timestamps, LWW or simple merge; CRDTs/OT reserved for text/canvas collaboration ([offline-first mobile architecture](https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-518n), [sync & conflict patterns guide](https://www.sachith.co.uk/offline-sync-conflict-resolution-patterns-architecture-trade%E2%80%91offs-practical-guide-feb-19-2026/)).

Takeaway: shipping shopping-list apps use **server-authoritative LWW + a client op queue + a refresh nudge**. None are CRDT-based.

---

## Implications for the decision

1. Realtime and offline are separable problems here. Realtime = "invalidate when someone else writes" (solved by a poll or one SSE endpoint). Offline = "reads survive + writes queue through a dead zone" (solved by persister + mutation queue). Neither requires a sync engine.
2. Every sync engine adds at least one always-on service to a deliberately-minimal single-box deployment; two of five (TanStack DB, Legend-State v3) are alpha/beta, Zero's RN client is months old, PowerSync wants bucket storage. For 7 tables and household-sized concurrency this is capability you'd pay ops-tax for and not use.
3. The domain's conflicts (check flags, adds, deletes) are LWW-trivial with UUIDs + tolerant mutations — the hard part of sync engines (merge semantics) is a non-problem here.
4. The TanStack Query middle ground has real sharp edges (pausing flakiness, stuck queues) but they're all mitigable with known recipes, and it's ~zero new infra. It also leaves a clean upgrade path: TanStack DB + Electric when TanStack DB stabilizes, since both sit on the same TanStack Query foundation and Electric keeps writes in your API.

## Recommendation lean

**Simple tier + middle ground; no sync engine.**

- Realtime: start with `refetchOnWindowFocus`/`AppState` refetch + `refetchInterval` (~5–10s) on the open list. If push feels warranted later, add **one SSE endpoint** emitting `{listId}` invalidation events from NestJS (native `@Sse()`, `flush_interval -1` in Caddy, `react-native-sse` on Expo). Skip WebSockets entirely — no bidirectional need; skip socket.io regardless.
- Offline: `persistQueryClient` (AsyncStorage/IDB) + `networkMode: 'offlineFirst'` + `setMutationDefaults` per mutation + `resumePausedMutations` on restore + `onlineManager` wired to NetInfo. Server rules: client UUIDs, LWW updates, deletes/updates as tolerant no-ops.
- Re-evaluate only if requirements grow to long-offline multi-device editing or per-item granular live sync — then Electric (+ TanStack DB once stable) is the earmarked upgrade, PowerSync the fallback if full offline SQLite becomes the requirement.

---

## Sources

- https://tkdodo.eu/blog/using-web-sockets-with-react-query
- https://tkdodo.eu/blog/offline-react-query
- https://tanstack.com/query/latest/docs/framework/react/guides/mutations (+ Context7 `/tanstack/query`)
- https://ably.com/blog/websockets-vs-sse
- https://www.hirenodejs.com/blog/nodejs-server-sent-events-sse-2026
- https://www.pkgpulse.com/guides/socketio-vs-ws-vs-uwebsockets-websocket-servers-nodejs-2026
- https://dev.to/axiom_agent/nodejs-websockets-in-production-socketio-vs-ws-scaling-and-reconnection-strategies-5b68
- https://caddyserver.com/docs/caddyfile/directives/reverse_proxy
- https://github.com/caddyserver/caddy/issues/6420, /6958, https://github.com/leafac/caddy-express-sse
- https://github.com/electric-sql/electric, https://pglite.dev/docs/sync, https://electric-sql.com/blog/2026/03/25/tanstack-db-0.6-app-ready-with-persistence-and-includes
- https://powersync.com/open-source, https://docs.powersync.com/client-sdks/reference/react-native-and-expo, https://releases.powersync.com/announcements/introducing-postgres-for-sync-bucket-storage
- https://www.infoq.com/news/2026/06/zero-version-1/, https://zero.rocicorp.dev/docs/self-host, https://zero.rocicorp.dev/docs/react-native
- https://tanstack.com/db/latest/docs/overview, https://tanstack.com/blog/tanstack-db-0.6-app-ready-with-persistence-and-includes
- https://legendapp.com/open-source/state/v3/, https://github.com/LegendApp/legend-state/issues/405
- https://github.com/TanStack/query/issues/4170, /5847, /6825, https://github.com/TanStack/query/discussions/5248
- https://github.com/ibm-watson-data-lab/shopping-list-vanillajs-pouchdb, https://shoppinglist.otherworld.dev/, https://github.com/nanawel/our-shopping-list
- https://dev.to/odunayo_dada/offline-first-mobile-app-architecture-syncing-caching-and-conflict-resolution-518n
