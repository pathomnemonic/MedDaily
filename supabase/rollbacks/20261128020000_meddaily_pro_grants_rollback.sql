-- Rollback for 20261128020000_meddaily_pro_grants.sql (issue 165).
-- Restores start_trial to the direct entitlements write from
-- 20261128000000, then drops the grant functions and tables. Any grants
-- recorded while the migration was live are lost; the summary rows in
-- meddaily.entitlements stay as they were last recomputed.

create or replace function meddaily.start_trial()
returns meddaily.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  e meddaily.entitlements;
begin
  if uid is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if meddaily.is_anonymous() then
    raise exception 'guest_cannot_start_trial' using errcode = '55000',
      hint = 'Sign in with a real account to start the free trial.';
  end if;
  if not meddaily.has_profile() then
    raise exception 'no_profile' using errcode = '55000',
      hint = 'Create the Roundsy profile before starting the trial.';
  end if;
  if exists (select 1 from meddaily.trial_ledger l where l.user_id = uid) then
    raise exception 'trial_already_used' using errcode = '55000',
      hint = 'The free trial is once per account.';
  end if;
  select * into e from meddaily.entitlements where user_id = uid;
  if found and e.plan <> 'free' and e.status in ('active', 'trialing', 'past_due') then
    raise exception 'already_subscribed' using errcode = '55000',
      hint = 'This account already has Pro.';
  end if;
  insert into meddaily.trial_ledger (user_id) values (uid);
  insert into meddaily.entitlements
    (user_id, plan, source, status, trial_ends_at, current_period_end, provider_customer_id, provider_subscription_id)
  values
    (uid, 'pro_yearly', 'trial', 'trialing', now() + interval '7 days', null, null, null)
  on conflict (user_id) do update set
    plan = excluded.plan, source = excluded.source, status = excluded.status,
    trial_ends_at = excluded.trial_ends_at, current_period_end = null,
    provider_customer_id = null, provider_subscription_id = null
  returning * into e;
  return e;
end $$;

drop function if exists meddaily.claim_store_purchase(text, text, uuid, text, timestamptz, boolean);
drop function if exists meddaily.revoke_pro_source(uuid, text);
drop function if exists meddaily.grant_pro(uuid, text, text, text, timestamptz, timestamptz);
drop function if exists meddaily.recompute_entitlement(uuid);
drop table if exists meddaily.pro_store_purchases;
drop table if exists meddaily.pro_grants;
