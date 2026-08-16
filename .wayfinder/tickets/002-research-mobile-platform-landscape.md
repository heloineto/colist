---
title: Research mobile platform landscape (Expo/RN vs PWA)
labels: [wayfinder:research]
status: closed
assignee: claude
blocked-by: []
---

## Question

Colist is used primarily on phones; today it's a Next.js PWA with no offline writes. Surface the facts the platform decision waits on:

- State of the art for React Native/Expo (expo-router, EAS, new architecture, OTA updates) as of 2026.
- How an Expo app lives inside a bun + turborepo monorepo (vav-style); interop with bun.
- What carries over from the user's stack (TanStack Query, zod, react-hook-form, Tailwind via NativeWind?, Mantine does NOT — what replaces it?).
- PWA-in-2026 counterpoint: install UX on iOS/Android, push notifications, offline, app-store presence.
- "Both" option: Expo + react-native-web, or Expo app + thin Next.js web — real-world cost.
- Rough effort comparison for a small CRUD app like colist.

Findings → `.wayfinder/research/mobile-platform-landscape.md`.

## Resolution

Full findings: [`.wayfinder/research/mobile-platform-landscape.md`](../research/mobile-platform-landscape.md).

- **Expo 2026**: SDK 57 (RN 0.86 / React 19.2), New Architecture default, expo-router mature (though it forked React Navigation in SDK 56 — some churn risk). EAS free tier ≈30 builds/mo, OTA to 1,000 MAU; OTA JS updates are store-compliant.
- **Monorepo**: bun + turborepo officially supported by Expo (metro-config auto-detects workspaces; EAS picks bun from the lockfile). Gotchas: `trustedDependencies`, pin react/RN at root.
- **Stack carry-over**: TanStack Query, zod, react-hook-form all port. Mantine does NOT — closest replacement is NativeWind (v4 stable; v5/Tailwind-4 parity pre-release) + react-native-reusables. `phosphor-react-native` exists and is maintained.
- **PWA 2026**: iOS push works (home-screen installs only), improved install in iOS 26, but no install prompt and no App Store path; Android PWA/TWA → Play Store is mature.
- **Both**: react-native-web won't reach Mantine-grade web polish; Expo app + thin Next.js sharing packages is the proven pattern at ~1.5× UI cost.
- **Effort**: PWA modernization ~2–4 wks vs Expo rewrite ~6–10 wks.

Research lean: modernize the PWA + ship Android via TWA first (Brazil is Android-heavy), keep the monorepo Expo-ready; go Expo only if App Store presence is a hard requirement. Final call belongs to the Mobile platform decision ticket.
