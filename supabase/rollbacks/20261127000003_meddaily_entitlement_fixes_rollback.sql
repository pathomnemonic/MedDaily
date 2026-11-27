-- Rollback for 20261127000003_meddaily_entitlement_fixes.sql (issue 150).
-- Restores the prior bodies verbatim: delete_my_account as of
-- 20261127000001 (guard without the kofi source) and has_pro as of the
-- schema migration with the hardening search_path (status active or
-- trialing only, and no dateless admin grant rule).

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
  -- hand host over to the earliest remaining player, as leave_room does, so
  -- surviving rooms never point at the departed account (issue 144)
  update meddaily.rooms r
     set host_id = (select p.user_id from meddaily.room_players p
                     where p.room_code = r.code and p.user_id <> auth.uid()
                     order by p.joined_at limit 1)
   where r.host_id = auth.uid()
     and exists (select 1 from meddaily.room_players p
                  where p.room_code = r.code and p.user_id <> auth.uid());
  delete from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.rooms r
   where r.code = any (my_rooms)
     and not exists (select 1 from meddaily.room_players p where p.room_code = r.code);
  delete from meddaily.profiles where user_id = auth.uid(); -- cascades results, player_state, entitlements
end $$;

create or replace function meddaily.has_pro() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((
    select e.plan <> 'free'
       and e.status in ('active', 'trialing')
       and (e.plan = 'pro_lifetime'
            or coalesce(e.current_period_end, e.trial_ends_at, '-infinity'::timestamptz) > now())
    from meddaily.entitlements e where e.user_id = auth.uid()
  ), false)
$$;
