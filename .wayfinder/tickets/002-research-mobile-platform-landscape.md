---
title: Research mobile platform landscape (Expo/RN vs PWA)
labels: [wayfinder:research]
status: open
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
