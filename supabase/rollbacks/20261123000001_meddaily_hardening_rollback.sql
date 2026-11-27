-- Undo 20261123000000_meddaily_hardening.sql (restores the original search_path and the broader empty-room cleanup).
alter function meddaily.has_profile() set search_path = meddaily, pg_temp;
alter function meddaily.ensure_profile(text) set search_path = meddaily, pg_temp;
alter function meddaily.has_pro() set search_path = meddaily, pg_temp;
alter function meddaily.is_room_member(text) set search_path = meddaily, pg_temp;
alter function meddaily.room_state_json(text) set search_path = meddaily, pg_temp;
alter function meddaily.get_room_state(text) set search_path = meddaily, pg_temp;
alter function meddaily.join_room(text, text, text, text, date, bigint, text) set search_path = meddaily, pg_temp;
alter function meddaily.submit_score(text, integer, integer, boolean) set search_path = meddaily, pg_temp;
alter function meddaily.leave_room(text) set search_path = meddaily, pg_temp;
alter function meddaily.cleanup_rooms() set search_path = meddaily, pg_temp;
create or replace function meddaily.delete_my_account() returns void
language plpgsql security definer set search_path = meddaily, pg_temp as $$
declare e meddaily.entitlements;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select * into e from meddaily.entitlements where user_id = auth.uid();
  if found and e.plan <> 'free' and e.status in ('active', 'trialing', 'past_due')
     and e.source in ('stripe', 'apple', 'google') and e.plan <> 'pro_lifetime' then
    raise exception 'cancel_subscription_first' using errcode = '55000';
  end if;
  delete from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.rooms r where not exists (select 1 from meddaily.room_players p where p.room_code = r.code);
  delete from meddaily.profiles where user_id = auth.uid();
end $$;
