SET check_function_bodies = OFF;

CREATE OR REPLACE FUNCTION "public"."createProfile"()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER SET SEARCH_PATH = ''
    AS $function$
BEGIN
    INSERT INTO "public"."profiles"("id", "email", "name")
        VALUES(NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE TRIGGER "createProfileTrigger"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."createProfile"();