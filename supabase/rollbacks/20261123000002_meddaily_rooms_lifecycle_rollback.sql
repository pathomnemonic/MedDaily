-- Undo 20261123000002_meddaily_rooms_lifecycle.sql: restores the previous room functions.
-- Self contained (issue 146): the prior bodies of room_state_json, join_room,
-- submit_score and cleanup_rooms are written out in full below, taken from
-- 20261122000000_meddaily_schema.sql with set search_path = '' as in the
-- hardening migration, instead of referencing them in a comment.

do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'meddaily_cleanup_rooms';
  end if;
end $$;

drop function if exists meddaily.touch_room(text);

create or replace function meddaily.room_state_json(p_code text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', r.code, 'gameId', r.game_id, 'scope', r.scope, 'specialty', r.specialty,
    'date', to_char(r.day, 'YYYY-MM-DD'), 'seed', r.seed, 'hostUid', r.host_id, 'status', r.status,
    'players', coalesce((
      select jsonb_agg(jsonb_build_object(
        'uid', p.user_id, 'name', p.name, 'score', p.score, 'maxScore', p.max_score,
        'finished', p.finished, 'perfect', p.perfect) order by p.joined_at)
      from meddaily.room_players p where p.room_code = r.code), '[]'::jsonb))
  from meddaily.rooms r where r.code = p_code
$$;

create or replace function meddaily.join_room(
  p_code text, p_game_id text, p_scope text, p_specialty text, p_day date, p_seed bigint, p_name text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_room meddaily.rooms;
  v_count integer;
  v_name text := left(btrim(coalesce(p_name, '')), 20);
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if v_code !~ '^[A-Z0-9]{6}$' then raise exception 'bad_room_code' using errcode = '22023'; end if;
  if v_name = '' then v_name := 'Guest'; end if;

  select * into v_room from meddaily.rooms where code = v_code for update;
  if not found then
    insert into meddaily.rooms (code, game_id, scope, specialty, day, seed, host_id)
      values (v_code, p_game_id, p_scope, p_specialty, p_day, p_seed, auth.uid())
      on conflict (code) do nothing;
    select * into v_room from meddaily.rooms where code = v_code for update;
  end if;

  if v_room.game_id <> p_game_id or v_room.scope <> p_scope or v_room.specialty <> p_specialty
     or v_room.day <> p_day or v_room.seed <> p_seed then
    raise exception 'room_mismatch' using errcode = '22023',
      hint = 'That room belongs to a different game, date, or study track.';
  end if;

  if not exists (select 1 from meddaily.room_players where room_code = v_code and user_id = auth.uid()) then
    select count(*) into v_count from meddaily.room_players where room_code = v_code;
    if v_count >= 8 then raise exception 'room_full' using errcode = '53400'; end if;
    insert into meddaily.room_players (room_code, user_id, name) values (v_code, auth.uid(), v_name);
  else
    update meddaily.room_players set name = v_name where room_code = v_code and user_id = auth.uid();
  end if;
  update meddaily.rooms set updated_at = now() where code = v_code;
  return meddaily.room_state_json(v_code);
end $$;

create or replace function meddaily.submit_score(p_code text, p_score integer, p_max integer, p_perfect boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_code text := upper(p_code);
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if p_score is null or p_max is null or p_score < 0 or p_max < 0 or p_score > p_max then
    raise exception 'bad_score' using errcode = '22023';
  end if;
  update meddaily.room_players
     set score = p_score, max_score = p_max, perfect = (coalesce(p_perfect, false) and p_score = p_max), finished = true
   where room_code = v_code and user_id = auth.uid() and finished = false;
  if not found then
    if meddaily.is_room_member(v_code) then raise exception 'already_submitted' using errcode = '23505'; end if;
    raise exception 'not_in_room' using errcode = '42501';
  end if;
  update meddaily.rooms set status = 'playing', updated_at = now() where code = v_code;
end $$;

create or replace function meddaily.cleanup_rooms() returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  delete from meddaily.rooms where updated_at < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end $$;

drop function if exists meddaily.room_is_over(text);

alter table meddaily.room_players drop column if exists last_seen_at;
