-- Rollback for 20261127000000_meddaily_sprint_score_constraints.sql (issue 139).
-- Restores the original game-rule CHECK constraints on meddaily.room_players.
-- Note: this rollback fails if any stored row has score > max_score or a
-- perfect row with score <> max_score, which is expected: those rows are the
-- sprint results the fix exists to keep.

alter table meddaily.room_players drop constraint if exists room_players_score_within_ceiling;
alter table meddaily.room_players drop constraint if exists room_players_perfect_means_target;

alter table meddaily.room_players
  add constraint room_players_check
  check (score is null or max_score is null or score <= max_score);

alter table meddaily.room_players
  add constraint room_players_check1
  check (perfect = false or (score is not null and score = max_score));
