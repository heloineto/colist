CREATE OR REPLACE FUNCTION "public"."checkShoppingCategoryListMatch"()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."categoryId" IS NOT NULL THEN
        PERFORM 1
        FROM "public"."categories" category
        WHERE "category"."id" = NEW."categoryId"
          AND "category"."listId" = NEW."listId";

        IF NOT FOUND THEN
            RAISE EXCEPTION 'The categoryId % does not belong to listId %', NEW."categoryId", NEW."listId";
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "checkShoppingCategoryListMatchTrigger"
BEFORE INSERT OR UPDATE ON "public"."items"
FOR EACH ROW
EXECUTE FUNCTION "public"."checkShoppingCategoryListMatch"();
