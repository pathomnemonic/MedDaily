-- Rollback for 20261122000000_meddaily_schema.sql. Destroys ALL MedDaily data in the shared project.
-- Does not touch auth.users, public, or any other app's schema.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime drop table meddaily.rooms, meddaily.room_players; exception when others then null; end;
  end if;
end $$;
drop schema if exists meddaily cascade;
