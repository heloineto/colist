CREATE TABLE "public"."profiles"(
  "id" uuid NOT NULL PRIMARY KEY REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  "created" timestamp with time zone NOT NULL DEFAULT NOW(),
  "name" text,
  "email" text UNIQUE NOT NULL,
  "picture" text
);

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grant ALL to users for their own profile" ON "public"."profiles" AS permissive
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);