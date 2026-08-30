# Domain model v2

Type: grilling
Status: resolved

## Question

Model colist's domain properly (`/domain-modeling` + `/grilling`) — the schema was grown, not designed, and authorization moves from RLS into the API.

Current tables: profiles, lists, members (owner|member), categories, items, errors, feedbacks. Known defects to resolve in v2, not port:
- No `updated_at` anywhere (the sort-by-modification UI option 400s today).
- RLS holes that become API authorization rules: `members` SELECT was `USING (TRUE)` (any user could read all memberships); `categories`/`items` lacked `WITH CHECK` (cross-list writes possible); `lists` had no INSERT policy (RPC workaround).
- Category↔item list-coherence enforced by trigger — becomes an API invariant.
- Seeded test users lived in a migration — never again.

Decide: history/activity log in or out (UI is built, commented out, no table); category rename (FUTURE comment); do `errors`/`feedbacks` survive as tables or move to an external tool; accented-alphabetical sort (PostgreSQL collation).

Output: v2 schema + ubiquitous language (start `CONTEXT.md`, vav-style).

## Answer

Grilled 2026-08-23, three rounds. Ubiquitous language started in [`CONTEXT.md`](../../../CONTEXT.md) (User, List, Item, Category, Membership/Member, Owner, Activity, Feedback, Error report).

### Decisions

- **profiles table dies** — merged into better-auth's `user` (name/email/image built in; picture → S3 avatar URL).
- **History IN**: `activities` append-only table, capturing **all** mutations (items, categories, memberships, list renames). Structured payload — `action` enum + denormalized `actor_name`/`target_name` — client renders the localized sentence (a stored sentence would bake in one language). Actor FK `SET NULL`, rows CASCADE with list, no retention policy yet.
- **Category edit IN** — plain UPDATE endpoint, no schema impact.
- **`errors`/`feedbacks` both survive as tables.** Sentry removed from all plans (never adopted — noted on ticket 16). `message` becomes plain `text` (Tiptap dropped; migration flattens jsonb). Attachments stay as S3 keys (same presigned-PUT as avatars). API is insert-only — no admin surface; psql is the admin UI.
- **Member adding**: parity — owner types email, sees profile preview, adds directly. Enumeration oracle consciously accepted (closed alpha); revisit if public. No invite links.
- **Ownership**: single owner; on owner exit, auto-promote longest-standing member (needs `created_at` on memberships); list deleted when last member leaves.
- **PKs unchanged**: bigint identity (lists/categories/items), uuid (users) — makes ticket 11's copy 1:1.
- **Category↔item coherence**: composite FK replaces the trigger — `UNIQUE(id, list_id)` on categories; `items(category_id, list_id)` references it with `ON DELETE SET NULL (category_id)` (PG15+ column-subset form, so `list_id` isn't nulled).
- **Accented sort**: column-level ICU collation (`pt-BR-x-icu`) on `name` columns.
- **Conventions**: snake_case DB / camelCase TS via Drizzle; `created_at` + `updated_at` on every table (activities excepted — append-only); checking an item bumps `updated_at`, which feeds sort-by-modification.
- **Authorization parity**: member = read/write content + rename list; owner = delete list + manage memberships. Seeded users never in migrations (ticket 17's problem).

### v2 schema sketch

```
user, session, account, verification   -- better-auth-owned; user: id uuid, name, email unique, image
lists        id bigint identity PK, name text CHECK len>=1 COLLATE pt-BR-x-icu, created_at, updated_at
memberships  user_id uuid FK user CASCADE, list_id FK lists CASCADE,
             role enum(owner|member) default member, created_at, updated_at, PK(user_id, list_id)
categories   id bigint identity PK, list_id FK lists CASCADE, name text COLLATE pt-BR-x-icu,
             created_at, updated_at, UNIQUE(id, list_id)
items        id bigint identity PK, list_id FK lists CASCADE, category_id bigint NULL,
             name text COLLATE pt-BR-x-icu, amount int CHECK >=0 default 1, checked bool default false,
             details text, created_at, updated_at,
             FK (category_id, list_id) REFERENCES categories(id, list_id) ON DELETE SET NULL (category_id)
activities   id bigint identity PK, list_id FK lists CASCADE, actor_id uuid FK user SET NULL,
             actor_name text, action text/enum, target_name text, created_at
feedbacks    id bigint identity PK, user_id uuid FK user SET NULL, message text,
             rating int NULL CHECK 1..5, files text[] (S3 keys), created_at, updated_at
errors       id bigint identity PK, user_id uuid FK user SET NULL, message text, error jsonb,
             allow_communication bool, files text[] (S3 keys), created_at, updated_at
```
