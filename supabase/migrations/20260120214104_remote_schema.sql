drop extension if exists "pg_net";

drop trigger if exists "update_events_updated_at" on "public"."events";

drop policy "Organizers can create rules" on "public"."event_rules";

drop policy "Organizers can delete rules" on "public"."event_rules";

drop policy "Organizers can update rules" on "public"."event_rules";

drop policy "Rules are viewable by everyone" on "public"."event_rules";

drop policy "Events are viewable by everyone" on "public"."events";

drop policy "Organizers can create their own events" on "public"."events";

drop policy "Organizers can delete their own events" on "public"."events";

drop policy "Organizers can update their own events" on "public"."events";

drop policy "Anyone can join an event" on "public"."participants";

drop policy "Participants and organizers can delete" on "public"."participants";

drop policy "Participants and organizers can update" on "public"."participants";

drop policy "Participants are viewable by everyone" on "public"."participants";

revoke delete on table "public"."event_rules" from "anon";

revoke insert on table "public"."event_rules" from "anon";

revoke references on table "public"."event_rules" from "anon";

revoke select on table "public"."event_rules" from "anon";

revoke trigger on table "public"."event_rules" from "anon";

revoke truncate on table "public"."event_rules" from "anon";

revoke update on table "public"."event_rules" from "anon";

revoke delete on table "public"."event_rules" from "authenticated";

revoke insert on table "public"."event_rules" from "authenticated";

revoke references on table "public"."event_rules" from "authenticated";

revoke select on table "public"."event_rules" from "authenticated";

revoke trigger on table "public"."event_rules" from "authenticated";

revoke truncate on table "public"."event_rules" from "authenticated";

revoke update on table "public"."event_rules" from "authenticated";

revoke delete on table "public"."event_rules" from "service_role";

revoke insert on table "public"."event_rules" from "service_role";

revoke references on table "public"."event_rules" from "service_role";

revoke select on table "public"."event_rules" from "service_role";

revoke trigger on table "public"."event_rules" from "service_role";

revoke truncate on table "public"."event_rules" from "service_role";

revoke update on table "public"."event_rules" from "service_role";

revoke delete on table "public"."events" from "anon";

revoke insert on table "public"."events" from "anon";

revoke references on table "public"."events" from "anon";

revoke select on table "public"."events" from "anon";

revoke trigger on table "public"."events" from "anon";

revoke truncate on table "public"."events" from "anon";

revoke update on table "public"."events" from "anon";

revoke delete on table "public"."events" from "authenticated";

revoke insert on table "public"."events" from "authenticated";

revoke references on table "public"."events" from "authenticated";

revoke select on table "public"."events" from "authenticated";

revoke trigger on table "public"."events" from "authenticated";

revoke truncate on table "public"."events" from "authenticated";

revoke update on table "public"."events" from "authenticated";

revoke delete on table "public"."events" from "service_role";

revoke insert on table "public"."events" from "service_role";

revoke references on table "public"."events" from "service_role";

revoke select on table "public"."events" from "service_role";

revoke trigger on table "public"."events" from "service_role";

revoke truncate on table "public"."events" from "service_role";

revoke update on table "public"."events" from "service_role";

revoke delete on table "public"."participants" from "anon";

revoke insert on table "public"."participants" from "anon";

revoke references on table "public"."participants" from "anon";

revoke select on table "public"."participants" from "anon";

revoke trigger on table "public"."participants" from "anon";

revoke truncate on table "public"."participants" from "anon";

revoke update on table "public"."participants" from "anon";

revoke delete on table "public"."participants" from "authenticated";

revoke insert on table "public"."participants" from "authenticated";

revoke references on table "public"."participants" from "authenticated";

revoke select on table "public"."participants" from "authenticated";

revoke trigger on table "public"."participants" from "authenticated";

revoke truncate on table "public"."participants" from "authenticated";

revoke update on table "public"."participants" from "authenticated";

revoke delete on table "public"."participants" from "service_role";

revoke insert on table "public"."participants" from "service_role";

revoke references on table "public"."participants" from "service_role";

revoke select on table "public"."participants" from "service_role";

revoke trigger on table "public"."participants" from "service_role";

revoke truncate on table "public"."participants" from "service_role";

revoke update on table "public"."participants" from "service_role";

alter table "public"."event_rules" drop constraint "event_rules_event_id_fkey";

alter table "public"."events" drop constraint "events_organizer_id_fkey";

alter table "public"."participants" drop constraint "participants_event_id_fkey";

alter table "public"."participants" drop constraint "participants_event_id_name_key";

alter table "public"."event_rules" drop constraint "event_rules_pkey";

alter table "public"."events" drop constraint "events_pkey";

alter table "public"."participants" drop constraint "participants_pkey";

drop index if exists "public"."event_rules_pkey";

drop index if exists "public"."events_pkey";

drop index if exists "public"."participants_event_id_name_key";

drop index if exists "public"."participants_pkey";

drop table "public"."event_rules";

drop table "public"."events";

drop table "public"."participants";


