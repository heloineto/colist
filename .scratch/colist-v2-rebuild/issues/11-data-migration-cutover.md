# Production data migration and cutover

Type: grilling
Status: resolved
Blocked by: 07, 10

## Question

The app is live at colist.com.br on hosted Supabase (project `zgyllhgyslhshfbfujfu`) badged "Alpha v0.0.1". Decide:

- Migrate real user data (profiles incl. auth.users passwords — exportable?, lists, members, items, avatars in storage) vs declare alpha reset and start clean. How many real users are there, honestly?
- If migrating: dump → transform to v2 schema → load procedure; password hashes portability into the chosen auth system.
- Cutover order: DNS, old-app sunset, Supabase project teardown (and stop paying).

## Answer

Grilled 2026-08-29, two rounds.

**Full migrate.** ~10 real users, all reachable by WhatsApp. Users keep uuids, passwords, lists, memberships, items, categories, avatars. Alpha reset rejected (costs goodwill, saves a day).

- **Export**: `pg_dump --data-only` over Supabase's direct Postgres connection — `auth.users` (bcrypt in `encrypted_password`) + `public.*`. Avatars: small bun script listing bucket `profiles` and downloading each object (`<userId>/<filename>`). No Supabase CLI needed.
- **Transform**: load the dump into a `legacy` schema, then one committed SQL script of `INSERT … SELECT` into v2 tables:
  - `auth.users` + `profiles` → `user` + `account` (`providerId = 'credential'`, `password` = bcrypt hash; better-auth custom `password.verify` accepts bcrypt — per [Auth architecture decision](08-auth-architecture-decision.md)).
  - `members` → `memberships` (`created_at = now()` — legacy has none).
  - `lists/categories/items` 1:1 (PKs unchanged per [Domain model v2](10-domain-model-v2.md)); `camelCase` → `snake_case`.
  - `profiles.picture` filename → S3 avatar key on `user.image`; `errors/feedbacks.message` jsonb → text flattened.
  - `activities` starts empty; identity sequences `setval` to max(id).
  - Script is a one-shot, deleted after cutover.
- **Rehearsal (mandatory, the only test)**: run the whole pipeline into local docker Postgres from a real dump, boot v2 API on it, log in as yourself with your real password, see your lists. Prod run = same pipeline, different target.
- **Cutover order**: (1) v2 deployed on the new domain, empty DB, smoke-tested; (2) WhatsApp freeze announcement with the new URL; Vercel deploy paused; (3) export → transform → load into prod RDS, avatars → S3; (4) 1-week soak; (5) Supabase project paused, deleted after 30 days; Vercel project deleted. ~1h downtime. All sessions reset (users log in again). Old Vercel URL dies — no redirect.
- **Domain**: there is **no custom domain today** (only `*.vercel.app`; the map's "colist.com.br" was aspirational). One is required (TLS, stable cookie/SSE origin). Buy `colist.com.br` (or fallback) at **Registro.br**, delegate NS to a **Route 53 hosted zone owned by Terraform**. → new HITL task [Buy domain and delegate DNS to Route 53](20-buy-domain-delegate-dns.md), blocking [AWS and Terraform architecture](12-aws-terraform-architecture.md).

## Comments

- 2026-08-29: domain decision superseded — no purchase; prod host is `colist.heloineto.com` (subdomain NS-delegated to Route 53). See [Delegate colist.heloineto.com to Route 53](20-buy-domain-delegate-dns.md). `colist.com.br` deferred to go-public (map Out of scope).
