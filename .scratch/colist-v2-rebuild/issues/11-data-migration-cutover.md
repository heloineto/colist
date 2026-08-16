# Production data migration and cutover

Type: grilling
Status: open
Blocked by: 07, 10

## Question

The app is live at colist.com.br on hosted Supabase (project `zgyllhgyslhshfbfujfu`) badged "Alpha v0.0.1". Decide:

- Migrate real user data (profiles incl. auth.users passwords — exportable?, lists, members, items, avatars in storage) vs declare alpha reset and start clean. How many real users are there, honestly?
- If migrating: dump → transform to v2 schema → load procedure; password hashes portability into the chosen auth system.
- Cutover order: DNS, old-app sunset, Supabase project teardown (and stop paying).
