-- Undo 20261123000002_meddaily_rooms_lifecycle.sql: restores the previous room functions (see the hardening migration for their bodies).
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'meddaily_cleanup_rooms';
  end if;
end $$;
drop function if exists meddaily.touch_room(text);
-- Re-run the bodies of room_state_json, join_room, submit_score and cleanup_rooms from 20261122000000_meddaily_schema.sql
-- (with `set search_path = ''` as in the hardening migration), then:
drop function if exists meddaily.room_is_over(text);
alter table meddaily.room_players drop column if exists last_seen_at;
