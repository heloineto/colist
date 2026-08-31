-- legacy.* → v2. One transaction, idempotent (truncates first — also resets every session).
-- Requires: -v avatar_base=<public url prefix, no trailing slash>
BEGIN;

TRUNCATE "user", lists, errors, feedbacks CASCADE;

-- Seeded test users from the old migrations (ticket 10: never again).
DELETE FROM legacy.profiles WHERE email IN ('tester-1@gmail.com', 'tester-2@gmail.com');

INSERT INTO "user" (id, name, email, email_verified, image, created_at, updated_at)
SELECT id,
       coalesce(nullif(name, ''), split_part(email, '@', 1)),
       email,
       true,
       CASE WHEN picture IS NOT NULL THEN :'avatar_base' || '/' || id || '/' || picture END,
       created,
       created
FROM legacy.profiles;

-- better-auth 1.7 credential account: issuer 'local:credential', account_id = user id, bcrypt hash kept.
INSERT INTO account (user_id, issuer, account_id, provider_id, password, created_at, updated_at)
SELECT users.id, 'local:credential', users.id::text, 'credential', users.encrypted_password, users.created_at, users.updated_at
FROM legacy.users users
JOIN legacy.profiles profiles ON profiles.id = users.id
WHERE coalesce(users.encrypted_password, '') <> '';

INSERT INTO lists (id, name, created_at, updated_at) OVERRIDING SYSTEM VALUE
SELECT id, name, created, created FROM legacy.lists;

INSERT INTO memberships (user_id, list_id, role, created_at, updated_at)
SELECT members."profileId", members."listId", members.role::membership_role, now(), now()
FROM legacy.members members
JOIN legacy.profiles profiles ON profiles.id = members."profileId";

DELETE FROM lists WHERE NOT EXISTS (SELECT 1 FROM memberships WHERE memberships.list_id = lists.id);

INSERT INTO categories (id, list_id, name, created_at, updated_at) OVERRIDING SYSTEM VALUE
SELECT id, "listId", name, created, created
FROM legacy.categories WHERE "listId" IN (SELECT id FROM lists);

INSERT INTO items (id, list_id, category_id, name, amount, checked, details, created_at, updated_at) OVERRIDING SYSTEM VALUE
SELECT id, "listId", "categoryId", name, amount, checked, details, created, created
FROM legacy.items WHERE "listId" IN (SELECT id FROM lists);

-- Tiptap jsonb doc → plain text (all text nodes joined); scalar strings pass through.
CREATE FUNCTION legacy.flatten(doc jsonb) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT coalesce(
    nullif((SELECT string_agg(node #>> '{}', ' ') FROM jsonb_path_query(doc, 'strict $.**.text') node), ''),
    doc #>> '{}'
  )
$$;

INSERT INTO errors (id, user_id, message, error, allow_communication, files, created_at, updated_at) OVERRIDING SYSTEM VALUE
SELECT errors.id, profiles.id, legacy.flatten(errors.message), errors.error, errors."allowCommunication", coalesce(errors.files, '{}'), errors.created, errors.created
FROM legacy.errors errors
LEFT JOIN legacy.profiles profiles ON profiles.id = errors."profileId";

INSERT INTO feedbacks (id, user_id, message, rating, files, created_at, updated_at) OVERRIDING SYSTEM VALUE
SELECT feedbacks.id, profiles.id, coalesce(legacy.flatten(feedbacks.message), ''), feedbacks.rating, coalesce(feedbacks.files, '{}'), feedbacks.created, feedbacks.created
FROM legacy.feedbacks feedbacks
LEFT JOIN legacy.profiles profiles ON profiles.id = feedbacks."profileId";

DO $$ BEGIN
  PERFORM setval('lists_id_seq', coalesce(max(id), 1), max(id) IS NOT NULL) FROM lists;
  PERFORM setval('categories_id_seq', coalesce(max(id), 1), max(id) IS NOT NULL) FROM categories;
  PERFORM setval('items_id_seq', coalesce(max(id), 1), max(id) IS NOT NULL) FROM items;
  PERFORM setval('errors_id_seq', coalesce(max(id), 1), max(id) IS NOT NULL) FROM errors;
  PERFORM setval('feedbacks_id_seq', coalesce(max(id), 1), max(id) IS NOT NULL) FROM feedbacks;
END $$;

COMMIT;
