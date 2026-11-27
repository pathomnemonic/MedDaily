-- Issue 163: Roundsy Pro server plumbing.
--
-- Three pieces from docs/MONETIZATION_PLAN.md:
-- 1. A trial ledger keyed by user id. It has no foreign key to
--    meddaily.profiles, so deleting the Roundsy account never removes the
--    row and never hands out a second trial.
-- 2. meddaily.start_trial(): the one time, no card, 7 day Pro trial for a
--    signed in non guest account, exactly as the plan records it.
-- 3. An archive flag on meddaily.results, with the insert policy tightened
--    so an archive write only lands for a player who currently has Pro.
--    The plan asks for the has_pro() check on the client plus a server
--    check on archive writes; this policy is the server check.

create table if not exists meddaily.trial_ledger (
  user_id          uuid primary key,
  trial_started_at timestamptz not null default now()
);
alter table meddaily.trial_ledger enable row level security;
-- No policies and no client grants: only security definer functions and
-- the service role can touch this table.
grant all on meddaily.trial_ledger to service_role;

create or replace function meddaily.start_trial() returns meddaily.entitlements
language plpgsql security definer set search_path = '' as $$
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

revoke all on function meddaily.start_trial() from public, anon;
grant execute on function meddaily.start_trial() to authenticated;
grant execute on function meddaily.start_trial() to service_role;

alter table meddaily.results add column if not exists archive boolean not null default false;

drop policy if exists results_insert_own on meddaily.results;
create policy results_insert_own on meddaily.results for insert to authenticated
  with check (user_id = auth.uid() and meddaily.has_profile()
              and (archive = false or meddaily.has_pro()));
