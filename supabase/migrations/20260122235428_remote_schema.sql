drop trigger if exists "update_participant_profiles_updated_at" on "public"."participant_profiles";

drop policy "Users can insert own profile" on "public"."participant_profiles";

drop policy "Users can read own profile" on "public"."participant_profiles";

drop policy "Users can update own profile" on "public"."participant_profiles";

revoke delete on table "public"."participant_profiles" from "anon";

revoke insert on table "public"."participant_profiles" from "anon";

revoke references on table "public"."participant_profiles" from "anon";

revoke select on table "public"."participant_profiles" from "anon";

revoke trigger on table "public"."participant_profiles" from "anon";

revoke truncate on table "public"."participant_profiles" from "anon";

revoke update on table "public"."participant_profiles" from "anon";

revoke delete on table "public"."participant_profiles" from "authenticated";

revoke insert on table "public"."participant_profiles" from "authenticated";

revoke references on table "public"."participant_profiles" from "authenticated";

revoke select on table "public"."participant_profiles" from "authenticated";

revoke trigger on table "public"."participant_profiles" from "authenticated";

revoke truncate on table "public"."participant_profiles" from "authenticated";

revoke update on table "public"."participant_profiles" from "authenticated";

revoke delete on table "public"."participant_profiles" from "service_role";

revoke insert on table "public"."participant_profiles" from "service_role";

revoke references on table "public"."participant_profiles" from "service_role";

revoke select on table "public"."participant_profiles" from "service_role";

revoke trigger on table "public"."participant_profiles" from "service_role";

revoke truncate on table "public"."participant_profiles" from "service_role";

revoke update on table "public"."participant_profiles" from "service_role";

alter table "public"."participant_profiles" drop constraint "participant_profiles_user_id_fkey";

alter table "public"."participant_profiles" drop constraint "participant_profiles_user_id_key";

alter table "public"."participants" drop constraint "participants_user_id_fkey";

alter table "public"."participant_profiles" drop constraint "participant_profiles_pkey";

drop index if exists "public"."idx_participant_profiles_user_id";

drop index if exists "public"."idx_participants_user_id";

drop index if exists "public"."participant_profiles_pkey";

drop index if exists "public"."participant_profiles_user_id_key";

drop table "public"."participant_profiles";

alter table "public"."participants" drop column "user_id";


