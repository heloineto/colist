---
title: Realtime and offline strategy
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: [004-research-realtime-offline-sync, 005-mobile-platform-decision]
---

## Question

How much liveness and offline does colist v2 actually need, and what implements it?

Today: 3 Supabase Realtime subscriptions, all unfiltered ("any change anywhere wakes every user") and all just `refetch()`. No offline writes — the PWA shows a fallback page.

Grill:
- Is refetch-on-focus + short polling enough for a shared shopping list (ponytail floor), or is live presence-while-both-shopping a core experience?
- Offline: is add/check-while-offline a must (supermarket dead zones)? If yes, mutation queue vs a real sync engine — pull the research findings.
- Whatever is chosen must run on the vav-style single-instance infra (WS through Caddy is fine; a sync engine adds a service).
