CREATE POLICY "grant SELECT to members of the list"
ON "public"."lists"
AS permissive
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "public"."members"
    WHERE "profileId" = (SELECT auth.uid())
    AND "listId" = "id"
  )
);

CREATE POLICY "grant UPDATE to members of the list"
ON "public"."lists"
AS permissive
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "public"."members"
    WHERE "profileId" = (SELECT auth.uid())
    AND "listId" = "id"
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "public"."members"
    WHERE "profileId" = (SELECT auth.uid())
    AND "listId" = "id"
  )
);

CREATE POLICY "grant DELETE to the owner of the list"
ON "public"."lists"
AS permissive
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "public"."members"
    WHERE "profileId" = (SELECT auth.uid())
    AND "listId" = "id"
    AND "role" = 'owner'
  )
);