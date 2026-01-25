CREATE POLICY "grant SELECT to users that share a list" ON "public"."profiles"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM "public"."members" m1
      JOIN "public"."members" m2 ON m1."listId" = m2."listId"
      WHERE m1."profileId" = (SELECT auth.uid()) AND m2."profileId" = "public"."profiles"."id"
    )
  );