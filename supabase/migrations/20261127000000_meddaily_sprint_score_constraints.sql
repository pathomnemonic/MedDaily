-- Issue 139: the issue 125 fix taught meddaily.submit_score to accept an
-- above-target score in a splice room (up to a 1,000,000 sanity ceiling) and
-- to store perfect as p_score >= p_max. The room_players table still carries
-- the original game-rule CHECK constraints, so that UPDATE violates them:
--   room_players_check  : score <= max_score
--   room_players_check1 : perfect implies score = max_score
-- A sprint submission above the 240 target therefore still fails, inside the
-- function, and never reaches the room scoreboard.
--
-- Game rules belong to submit_score, which knows the room's game_id. The
-- table keeps only sanity constraints consistent with the function: a score
-- never exceeds the 1,000,000 ceiling, and perfect is stored only when the
-- target was reached or passed.

alter table meddaily.room_players drop constraint if exists room_players_check;
alter table meddaily.room_players drop constraint if exists room_players_check1;

alter table meddaily.room_players
  add constraint room_players_score_within_ceiling
  check (score is null or max_score is null or score <= 1000000);

alter table meddaily.room_players
  add constraint room_players_perfect_means_target
  check (perfect = false or (score is not null and max_score is not null and score >= max_score));
