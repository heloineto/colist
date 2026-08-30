-- Post-transform assertions. Fails loudly (ASSERT) when the copy is not 1:1.
DO $$
DECLARE
  expected bigint;
  actual bigint;
BEGIN
  SELECT count(*) INTO expected FROM legacy.profiles;
  SELECT count(*) INTO actual FROM "user";
  ASSERT actual = expected, format('user: %s, legacy.profiles: %s', actual, expected);

  SELECT count(*) INTO expected FROM legacy.users users JOIN legacy.profiles profiles ON profiles.id = users.id WHERE coalesce(users.encrypted_password, '') <> '';
  SELECT count(*) INTO actual FROM account WHERE issuer = 'local:credential' AND password LIKE '$2%';
  ASSERT actual = expected, format('account: %s, legacy.users with password: %s', actual, expected);

  SELECT count(*) INTO expected FROM legacy.members members JOIN legacy.profiles profiles ON profiles.id = members."profileId";
  SELECT count(*) INTO actual FROM memberships;
  ASSERT actual = expected, format('memberships: %s, legacy.members: %s', actual, expected);

  SELECT count(DISTINCT "listId") INTO expected FROM legacy.members members JOIN legacy.profiles profiles ON profiles.id = members."profileId";
  SELECT count(*) INTO actual FROM lists;
  ASSERT actual = expected, format('lists: %s, legacy lists with members: %s', actual, expected);

  SELECT count(*) INTO expected FROM legacy.categories WHERE "listId" IN (SELECT id FROM lists);
  SELECT count(*) INTO actual FROM categories;
  ASSERT actual = expected, format('categories: %s, legacy: %s', actual, expected);

  SELECT count(*) INTO expected FROM legacy.items WHERE "listId" IN (SELECT id FROM lists);
  SELECT count(*) INTO actual FROM items;
  ASSERT actual = expected, format('items: %s, legacy: %s', actual, expected);

  SELECT count(*) INTO expected FROM legacy.errors;
  SELECT count(*) INTO actual FROM errors;
  ASSERT actual = expected, format('errors: %s, legacy: %s', actual, expected);

  SELECT count(*) INTO expected FROM legacy.feedbacks;
  SELECT count(*) INTO actual FROM feedbacks;
  ASSERT actual = expected, format('feedbacks: %s, legacy: %s', actual, expected);

  SELECT count(*) INTO actual FROM legacy.profiles WHERE picture !~ '^[A-Za-z0-9._-]+$';
  ASSERT actual = 0, format('%s avatar file names are not URL-safe — encode them before building user.image', actual);

  SELECT count(*) INTO actual FROM items WHERE category_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM categories WHERE categories.id = items.category_id AND categories.list_id = items.list_id);
  ASSERT actual = 0, format('%s items reference a category from another list', actual);

  ASSERT (SELECT last_value FROM lists_id_seq) >= coalesce((SELECT max(id) FROM lists), 0), 'lists sequence behind max(id)';
  ASSERT (SELECT last_value FROM items_id_seq) >= coalesce((SELECT max(id) FROM items), 0), 'items sequence behind max(id)';
  ASSERT (SELECT last_value FROM categories_id_seq) >= coalesce((SELECT max(id) FROM categories), 0), 'categories sequence behind max(id)';
END $$;

SELECT 'user' AS "table", count(*) FROM "user"
UNION ALL SELECT 'account', count(*) FROM account
UNION ALL SELECT 'lists', count(*) FROM lists
UNION ALL SELECT 'memberships', count(*) FROM memberships
UNION ALL SELECT 'categories', count(*) FROM categories
UNION ALL SELECT 'items', count(*) FROM items
UNION ALL SELECT 'errors', count(*) FROM errors
UNION ALL SELECT 'feedbacks', count(*) FROM feedbacks;
