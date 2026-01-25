CREATE OR REPLACE FUNCTION "public"."getProfile"("email" text)
RETURNS SETOF "profiles"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT p."id", p."created", p."name", p."email", p."picture"
  FROM "public"."profiles" p
  WHERE p."email" = "getProfile"."email";
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."getProfile" FROM public, anon;