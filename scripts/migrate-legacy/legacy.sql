-- Legacy (Supabase) tables, column names as exported. Loaded from .migration/*.csv by the wizard.
DROP SCHEMA IF EXISTS legacy CASCADE;
CREATE SCHEMA legacy;

CREATE TABLE legacy.users (id uuid, email text, encrypted_password text, created_at timestamptz, updated_at timestamptz);
CREATE TABLE legacy.profiles (id uuid, created timestamptz, name text, email text, picture text);
CREATE TABLE legacy.lists (id bigint, created timestamptz, name text);
CREATE TABLE legacy.members ("profileId" uuid, "listId" bigint, role text);
CREATE TABLE legacy.categories (id bigint, created timestamptz, name text, "listId" bigint);
CREATE TABLE legacy.items (id bigint, created timestamptz, name text, amount integer, checked boolean, details text, "categoryId" bigint, "listId" bigint);
CREATE TABLE legacy.errors (id bigint, created timestamptz, message jsonb, "allowCommunication" boolean, error jsonb, files text[], "profileId" uuid);
CREATE TABLE legacy.feedbacks (id bigint, created timestamptz, message jsonb, files text[], rating integer, "profileId" uuid);
