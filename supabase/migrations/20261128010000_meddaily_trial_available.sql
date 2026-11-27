-- Trial availability read for the paywall (issue 164).
-- Mirrors the gates meddaily.start_trial() enforces (signed in, not a
-- guest, profile exists, trial never used, not already Pro) without
-- starting anything, so the client only offers the trial when a start
-- would succeed.

create or replace function meddaily.trial_available()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
     and not meddaily.is_anonymous()
     and meddaily.has_profile()
     and not exists (select 1 from meddaily.trial_ledger l where l.user_id = auth.uid())
     and not meddaily.has_pro();
$$;

revoke all on function meddaily.trial_available() from public;
grant execute on function meddaily.trial_available() to authenticated, service_role;
