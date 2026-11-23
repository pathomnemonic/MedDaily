-- Follow-up to 20261122000000_meddaily_schema.sql, from Orion's review. Re-runnable.
--
-- 1. delete_my_account() removed every empty room in the schema, not only rooms the caller was in. It now deletes only
--    rooms the caller belonged to that end up with no players.
-- 2. The security-definer functions now run with an empty search_path (every object they touch is schema-qualified),
--    matching the other apps' convention and removing any search_path hijack surface.

create or replace function meddaily.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  e meddaily.entitlements;
  my_rooms text[];
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select * into e from meddaily.entitlements where user_id = auth.uid();
  if found and e.plan <> 'free' and e.status in ('active', 'trialing', 'past_due')
     and e.source in ('stripe', 'apple', 'google') and e.plan <> 'pro_lifetime' then
    raise exception 'cancel_subscription_first' using errcode = '55000',
      hint = 'Cancel the active subscription with its provider before deleting the account.';
  end if;
  select coalesce(array_agg(room_code), '{}') into my_rooms from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.rooms r
   where r.code = any (my_rooms)
     and not exists (select 1 from meddaily.room_players p where p.room_code = r.code);
  delete from meddaily.profiles where user_id = auth.uid(); -- cascades results, player_state, entitlements
end $$;

alter function meddaily.has_profile() set search_path = '';
alter function meddaily.ensure_profile(text) set search_path = '';
alter function meddaily.has_pro() set search_path = '';
alter function meddaily.is_room_member(text) set search_path = '';
alter function meddaily.room_state_json(text) set search_path = '';
alter function meddaily.get_room_state(text) set search_path = '';
alter function meddaily.join_room(text, text, text, text, date, bigint, text) set search_path = '';
alter function meddaily.submit_score(text, integer, integer, boolean) set search_path = '';
alter function meddaily.leave_room(text) set search_path = '';
alter function meddaily.cleanup_rooms() set search_path = '';
