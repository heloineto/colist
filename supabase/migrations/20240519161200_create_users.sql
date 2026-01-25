CREATE OR REPLACE FUNCTION "public"."createUser"(
    "email" text,
    "password" text,
    "p_name" text,
    "p_picture" text
) RETURNS void AS $$
  declare
  user_id uuid;
BEGIN
  user_id := gen_random_uuid();
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, crypt(password, gen_salt('bf')), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{"provider":"email","providers":["email"]}', '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '', '', '', '');

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

  UPDATE "public"."profiles" SET "name" = "p_name", "picture" = "p_picture" WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION "public"."createUser" FROM public, anon, authenticated;

SELECT "public"."createUser"('tester-1@gmail.com', 'iOiJIUzI1NiIsInR5cC', 'Tester 1', NULL);
SELECT "public"."createUser"('tester-2@gmail.com', 'iOiJIUzI1NiIsInR5cC', 'Tester 2', NULL);

DROP FUNCTION "public"."createUser"(text, text, text, text);