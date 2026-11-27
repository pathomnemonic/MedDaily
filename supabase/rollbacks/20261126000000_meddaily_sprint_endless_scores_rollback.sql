-- Undo 20261126000000_meddaily_sprint_endless_scores.sql: restores submit_score
-- exactly as defined in 20261123000002_meddaily_rooms_lifecycle.sql.

create or replace function meddaily.submit_score(p_code text, p_score integer, p_max integer, p_perfect boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_code text := upper(p_code);
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if p_score is null or p_max is null or p_score < 0 or p_max < 0 or p_score > p_max then
    raise exception 'bad_score' using errcode = '22023';
  end if;
  if meddaily.room_is_over(v_code) and not exists (
       select 1 from meddaily.room_players where room_code = v_code and user_id = auth.uid() and finished) then
    raise exception 'room_finished' using errcode = '55000';
  end if;
  update meddaily.room_players
     set score = p_score, max_score = p_max, perfect = (coalesce(p_perfect, false) and p_score = p_max),
         finished = true, last_seen_at = now()
   where room_code = v_code and user_id = auth.uid() and finished = false;
  if not found then
    if meddaily.is_room_member(v_code) then raise exception 'already_submitted' using errcode = '23505'; end if;
    raise exception 'not_in_room' using errcode = '42501';
  end if;
  update meddaily.rooms set status = 'playing', updated_at = now() where code = v_code;
end $$;
