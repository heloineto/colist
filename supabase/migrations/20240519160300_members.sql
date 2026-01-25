CREATE TYPE "public"."membersRole" AS ENUM ('owner', 'member');

CREATE TABLE "public"."members" (
  "profileId" uuid NOT NULL REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "listId" bigint NOT NULL REFERENCES "public"."lists"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "role" "public"."membersRole" NOT NULL DEFAULT 'member',
  PRIMARY KEY ("profileId", "listId")
);

ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grant SELECT to all authenticated user" ON "public"."members"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "grant DELETE to users for their own row" ON "public"."members"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = "profileId");

CREATE POLICY "grant DELETE to owners"
ON "public"."members"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
  (
    SELECT "role" FROM "public"."members" m
    WHERE m."profileId" = (SELECT auth.uid())
    AND m."listId" = "public"."members"."listId"
  ) = 'owner'
  AND "public"."members"."role" = 'member'
);

CREATE POLICY "grant INSERT to owners"
ON "public"."members"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  (
    SELECT "role" FROM "public"."members" m
    WHERE m."profileId" = (SELECT auth.uid())
    AND m."listId" = "public"."members"."listId"
  ) = 'owner'
  AND "public"."members"."role" = 'member'
);

ALTER publication supabase_realtime ADD TABLE "public"."members";