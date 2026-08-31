# Mobile platform decision

Type: grilling
Status: resolved
Blocked by: 02, 04

## Question

React Native (Expo) vs staying a Next.js PWA vs both — the fork everything client-side hangs on.

Weigh with the user (`/grilling`):
- Colist is phone-first (bottom footer, drawers, portrait manifest) but currently reaches users with zero install friction via URL.
- RN unlocks push notifications, real offline, app-store presence; costs: new UI layer (Mantine doesn't port), store accounts/review, EAS or self-managed builds.
- PWA keeps the Mantine+Tailwind investment and Vercel simplicity; iOS PWA limits are the recurring pain.
- If RN: does a web client survive at all (landing page only? react-native-web?), and what happens to the current Vercel deployment?

Downstream: offline strategy (Realtime and offline strategy), UI kit, i18n, distribution, CI (EAS), Vercel fate.

## Answer

Grilled 2026-08-16. Decisions:

1. **Platform locked: web PWA.** No Expo, no react-native-web. A native app is a *future effort with its own map*, triggered only if store presence is ever judged worth it. The monorepo stays **Expo-ready**: domain types, zod schemas, API client, and i18n live in framework-agnostic `packages/`, so a future native app rebuilds only screens.
2. **Client framework: Vite + React SPA with TanStack Router** — not Next.js, despite it being the vav reference and the current app. Rationale: rebuilding from scratch makes framework continuity illusory; `vite build` static files served by Caddy on the ECS box removes the worst part of the Next-on-AWS port (second Node container / OpenNext); an auth-gated app has nothing to server-render; TanStack Router pairs natively with TanStack Query. TanStack **Start** was considered and rejected — still v1 RC as of 2026-08, and an SPA doesn't need it (it remains the SSR upgrade path).
3. **UI kit: Mantine + Tailwind 4 stay** (the PWA choice preserves them).
4. **Push notifications: ruled out entirely** — not deferred, won't do. Removes the biggest native-app pull.
5. **Distribution: URL + add-to-home-screen only for v2.** Play Store via TWA is deferred out of v2 — it's the first move when the app goes public (US$25 one-time, zero architectural prep). Apple App Store only via the future native effort.
6. Landing page, when it happens, is a static page Caddy also serves.

Inputs: [Research mobile platform landscape](02-research-mobile-platform-landscape.md), [Research realtime + offline sync](04-research-realtime-offline-sync.md). User context: friends-and-family now, small-traffic public app later; Brazil/Android-heavy.
