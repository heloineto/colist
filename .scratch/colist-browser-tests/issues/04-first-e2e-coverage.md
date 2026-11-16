# First e2e coverage

Type: grilling
Status: resolved
Blocked by: 03

## Question

Which user flows does the first batch of e2e specs cover (the minimum that would have caught a broken Mantine/React bump), which wait for later, and which unit specs, if any, are worth adding alongside?

## Answer

Decided by the agent (user directive), overridable in `decisions.html`. Priority: flows a user hits every day, built on the Mantine components most likely to break on a bump (inputs, Checkbox, Modal, Menu, Combobox, Notifications).

- **`auth.spec.ts`:** sign up via the form lands on `/app`; sign out; sign in with the same account; wrong password shows an error; `/app` while signed out redirects to `/auth`.
- **`lists.spec.ts`:** create a list, rename it, switch between two list tabs.
- **`items.spec.ts`:** add an item; check it (struck through) and uncheck it ("put back"); change the amount in the amount modal; assign a new category; delete an item; search filters items.
- **`sharing.spec.ts`:** share a list with `secondUser` by email; `secondUser` sees it; an item added by the owner appears for `secondUser` without reload (SSE realtime).
- **Later (fog, not this batch):** history drawer, profile edit, connected apps + OAuth consent page, language switch, offline mode, feedback with attachments (needs S3), Google sign-in (out of scope).
- **Unit:** no backfill. The 4 existing specs stay; new pure logic gets a spec when it is written.
