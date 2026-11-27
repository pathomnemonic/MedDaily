-- Rollback for 20261128000000_meddaily_pro_plumbing.sql (issue 163).
-- Restores the results insert policy as of the schema migration, drops the
-- archive column, the trial function and the trial ledger. Trial rows
-- already written to meddaily.entitlements stay; remove them by hand if a
-- rollback ever has to run after real trials have started.

drop policy if exists results_insert_own on meddaily.results;
create policy results_insert_own on meddaily.results for insert to authenticated
  with check (user_id = auth.uid() and meddaily.has_profile());

alter table meddaily.results drop column if exists archive;

drop function if exists meddaily.start_trial();
drop table if exists meddaily.trial_ledger;
