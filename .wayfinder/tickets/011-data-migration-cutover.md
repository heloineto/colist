---
title: Production data migration and cutover
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: [007-database-hosting-decision, 010-domain-model-v2]
---

## Question

The app is live at colist.com.br on hosted Supabase (project `zgyllhgyslhshfbfujfu`) badged "Alpha v0.0.1". Decide:

- Migrate real user data (profiles incl. auth.users passwords — exportable?, lists, members, items, avatars in storage) vs declare alpha reset and start clean. How many real users are there, honestly?
- If migrating: dump → transform to v2 schema → load procedure; password hashes portability into the chosen auth system.
- Cutover order: DNS, old-app sunset, Supabase project teardown (and stop paying).
