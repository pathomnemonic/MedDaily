-- Issue 125: Splice Sprint is endless and its score has no cap, but the client
-- reports it against the 240-point target, so submit_score raised bad_score for
-- every sprint run above 240 and the score silently never reached the shared
-- scoreboard in Supabase rooms. Accept above-maximum scores for the endless
-- sprint only, up to a sanity ceiling; every other game keeps score <= max.
-- Perfect for the sprint means reaching the target, so the stored flag uses
-- p_score >= p_max (identical to = for the other games, where score <= max
-- is still enforced). Body otherwise matches 20261123000002.

create or replace function meddaily.submit_score(p_code text, p_score integer, p_max integer, p_perfect boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_code text := upper(p_code); v_game text;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if p_score is null or p_max is null or p_score < 0 or p_max < 0 then
    raise exception 'bad_score' using errcode = '22023';
  end if;
  select game_id into v_game from meddaily.rooms where code = v_code;
  if p_score > p_max and not (v_game = 'splice' and p_score <= 1000000) then
    raise exception 'bad_score' using errcode = '22023';
  end if;
  if meddaily.room_is_over(v_code) and not exists (
       select 1 from meddaily.room_players where room_code = v_code and user_id = auth.uid() and finished) then
    raise exception 'room_finished' using errcode = '55000';
  end if;
  update meddaily.room_players
     set score = p_score, max_score = p_max, perfect = (coalesce(p_perfect, false) and p_score >= p_max),
         finished = true, last_seen_at = now()
   where room_code = v_code and user_id = auth.uid() and finished = false;
  if not found then
    if meddaily.is_room_member(v_code) then raise exception 'already_submitted' using errcode = '23505'; end if;
    raise exception 'not_in_room' using errcode = '42501';
  end if;
  update meddaily.rooms set status = 'playing', updated_at = now() where code = v_code;
end $$;
