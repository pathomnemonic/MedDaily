-- Rollback for 20261128010000_meddaily_trial_available.sql (issue 164).
drop function if exists meddaily.trial_available();
