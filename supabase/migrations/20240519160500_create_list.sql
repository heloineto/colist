CREATE OR REPLACE FUNCTION "public"."createList"("name" text)
RETURNS SETOF "public"."lists"
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_list RECORD;
BEGIN
  INSERT INTO "public"."lists"("name")
  VALUES ("createList"."name")
  RETURNING * INTO new_list;

  INSERT INTO "public"."members"("profileId", "listId", "role")
  VALUES (auth.uid(), new_list."id", 'owner');

  RETURN NEXT new_list;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."createList" FROM public, anon;