---
title: Domain model v2
labels: [wayfinder:grilling]
status: open
assignee:
blocked-by: []
---

## Question

Model colist's domain properly (`/domain-modeling` + `/grilling`) — the schema was grown, not designed, and authorization moves from RLS into the API.

Current tables: profiles, lists, members (owner|member), categories, items, errors, feedbacks. Known defects to resolve in v2, not port:
- No `updated_at` anywhere (the sort-by-modification UI option 400s today).
- RLS holes that become API authorization rules: `members` SELECT was `USING (TRUE)` (any user could read all memberships); `categories`/`items` lacked `WITH CHECK` (cross-list writes possible); `lists` had no INSERT policy (RPC workaround).
- Category↔item list-coherence enforced by trigger — becomes an API invariant.
- Seeded test users lived in a migration — never again.

Decide: history/activity log in or out (UI is built, commented out, no table); category rename (FUTURE comment); do `errors`/`feedbacks` survive as tables or move to an external tool; accented-alphabetical sort (PostgreSQL collation).

Output: v2 schema + ubiquitous language (start `CONTEXT.md`, vav-style).
