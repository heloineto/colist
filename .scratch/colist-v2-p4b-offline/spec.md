# P4b — Web client, offline & crash capture

Status: done
Source: [Implementation phasing § P4b](../colist-v2-rebuild/issues/18-implementation-phasing.md) + tickets [09 realtime/offline](../colist-v2-rebuild/issues/09-realtime-offline-strategy.md) (points 5–8), [16 observability](../colist-v2-rebuild/issues/16-observability-stack.md) (client-crash part); data layer per the [P4a spec](../colist-v2-p4a-web/spec.md) § 1.
Branch: `feat/p4b-offline` (PR #7 → `feat/p4a-web`; stack #2 ← #1 ← #4 ← #5 ← #6 ← #7).
Base facts (from P4a): orval fetch client in `src/shared/api/generated` (mutation keys `['itemsCreate']` etc., variables `{ listId, itemId?, data? }`), global toast caches + `meta { silent, success }` in `src/shared/api/query-client.ts`, SSE blanket-invalidate on `onopen` in `use-list-events.ts`, items already send `clientId` UUIDs, `VITE_APP_VERSION` build-arg wired (Dockerfile + `vite-env.d.ts`), vite-plugin-pwa `generateSW` + `registerType: 'autoUpdate'` already precaching the SPA.

## Scope

### 1. Offline reads — persisted cache + app shell
- **Deps**: `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`, `idb-keyval`.
- `createAsyncStoragePersister({ storage: idb-keyval get/set/del })`; swap `QueryClientProvider` → `PersistQueryClientProvider` in `app/providers.tsx` with `persistOptions: { persister, maxAge: 7d, buster: VITE_APP_VERSION ?? 'dev' }`; queries `gcTime: 7d` (must be ≥ maxAge).
- `onSuccess` of the provider → `resumePausedMutations().then(() => invalidateQueries())` — the reload-resume + reconnect blanket invalidate (ticket 09 §8).
- **SW**: keep `generateSW`; add `workbox.navigateFallbackDenylist: [/^\/api\//]` — without it the SW serves index.html to the Google OAuth top-level navigation `/api/auth/callback/*`.
- **`/~offline` page from phasing: dropped** — the precached SPA *is* the navigation fallback; a separate offline page would never render. Deviation noted here, not a new decision.
- Auth gate offline: `_authed` `beforeLoad` currently bounces to `/auth` whenever `getSession()` returns no data — offline reload would eject the user. Change: redirect only when `navigator.onLine`; offline proceeds (`user: null`; route context has no consumers).

### 2. Offline writes — paused-mutation queue (content ops only, ticket 09 §6–7)
- Global mutation default `networkMode: 'always'` → non-content ops (lists, memberships, feedback, profile, uploads) **fail fast** offline: fetch throws, global toast shows new `errors.offline` (describe() maps `!navigator.onLine`/`TypeError` → offline message). Zero call-site changes.
- `queryClient.setMutationDefaults` for the six content keys (`itemsCreate|Update|Delete`, `categoriesCreate|Rename|Delete`) in a new `src/shared/api/offline.ts`:
  - `networkMode: 'online'` → pauses offline, persists (default `shouldDehydrateMutation` = isPaused), resumes on reconnect/reload.
  - `mutationFn` dispatching on variables to the generated fetch fns — required for resume-after-reload.
  - `retry: 3`; a 404 on resume = op against a deleted item/list → dropped silently (toast suppression for content-op 404s in `MutationCache.onError`) — per ticket 09 §7 + P4a handoff note.
- **Optimistic items** (`onMutate` in the defaults, pure helpers in `src/shared/api/optimistic-items.ts` + vitest): patch every cached `/api/lists/:id/items*` query — create appends (temp negative id, keeps `clientId`), update patches by `itemId`, delete removes. Makes offline add/check/edit visible immediately and persist across reload; call sites keep their `onSuccess`/`onSettled` invalidates (distinct keys, shallow merge safe).
- `item-form` closes on `mutate` (not `onSuccess`) so the drawer doesn't hang offline; optimistic row shows instantly.
- `ponytail:` categories queue but get no optimistic insert (a temp category id would leak into `item.categoryId` FKs); they appear on reconnect. Lists badge counts stay stale offline.

### 3. Crash capture → `POST /errors` (ticket 16)
- `src/shared/lib/crash-report.ts`: `reportCrash(error, code?)` → `errorsCreate({ error: { code?, name, message, stack, route: location.pathname, userAgent, appVersion: VITE_APP_VERSION ?? 'dev' } })`, fire-and-forget.
  - Dedup guard: in-memory hash of `name+message+stack`, max 10 posts per page load (vitest).
  - Offline crashes dropped (`!navigator.onLine` → return).
- Wired in `main.tsx`: `window.onerror`, `unhandledrejection`, and router `defaultErrorComponent` → reports once + translated crash screen (title, description, reload button).
- i18n keys (pt/en/es): `errors.offline`, `errors.crashTitle`, `errors.crashDescription`, `errors.reload`.

## Done
- Airplane-mode (Playwright `context.setOffline` against `vite preview` build + API :5100): add/check/edit items offline → visible; reload offline → app shell + items still there; reconnect → mutations flush, DB has them.
- A thrown client error lands in the `errors` table with `appVersion` + dedup respected.
- Non-content op offline → immediate `errors.offline` toast.
- `bun run lint && bun run test` green (root `lint:spell` trips only on untracked `scripts/migrate-*.sh` — known); `apps/web` image builds.
- PR `feat/p4b-offline` → `feat/p4a-web`; map updated.

## Comments

- 2026-08-30: **done** on `feat/p4b-offline`. As specced, plus what verification forced: `safeSession()` in `auth-client.ts` — better-auth `getSession()` **throws** `TypeError` offline (both `/auth` and `_authed` beforeLoad crashed to the error screen), and the offline signal is now "getSession threw", not `navigator.onLine` (which lies under network emulation and can lie in the field). Deviations already in scope notes: no `/~offline` page (SPA precache is the fallback), categories queue without optimistic inserts, lists badges stale offline. `item-form` closes on submit (optimistic) instead of on success. cspell words added (keyval, dedup(s), navigations). Verified with Playwright (scratchpad `pw/test.mjs`, `navigator.onLine` shimmed like airplane mode + `vite preview` for the real SW): offline add + check visible instantly, fail-fast toast on "Nova lista", offline reload restores shell + cache + queue from SW/IDB, reconnect flushes (rows landed in Postgres), crash probe landed in `errors` (`p4b-crash-probe`, appVersion `dev`, dedup guard on). Transient flicker possible if a reconnect refetch outruns the queue flush — accepted (LWW, blanket invalidate reconciles).
