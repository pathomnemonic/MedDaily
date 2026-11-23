-- Follow-up to 20261123000002: a quiet (hidden) unfinished member must not reopen a finished room.
-- Rejoining or sending a heartbeat refreshed last_seen_at, which made room_is_over() false again.
-- Finished members may still rejoin (to read the results); unfinished ones are refused once the room is over.

create or replace function meddaily.touch_room(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_code text := upper(p_code);
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  update meddaily.room_players set last_seen_at = now()
   where room_code = v_code and user_id = auth.uid()
     and (finished or not meddaily.room_is_over(v_code));
end $$;

create or replace function meddaily.join_room(
  p_code text, p_game_id text, p_scope text, p_specialty text, p_day date, p_seed bigint, p_name text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_room meddaily.rooms;
  v_count integer;
  v_name text := left(btrim(coalesce(p_name, '')), 20);
  v_member boolean;
  v_done boolean;
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

  select true, coalesce(finished, false) into v_member, v_done
    from meddaily.room_players where room_code = v_code and user_id = auth.uid();
  v_member := coalesce(v_member, false);
  if not v_member then
    if meddaily.room_is_over(v_code) then raise exception 'room_finished' using errcode = '55000'; end if;
    select count(*) into v_count from meddaily.room_players
     where room_code = v_code and (finished or last_seen_at > now() - interval '5 minutes');
    if v_count >= 8 then raise exception 'room_full' using errcode = '53400'; end if;
    insert into meddaily.room_players (room_code, user_id, name) values (v_code, auth.uid(), v_name);
  else
    -- an unfinished member cannot come back to a room that already closed without them
    if not v_done and meddaily.room_is_over(v_code) then raise exception 'room_finished' using errcode = '55000'; end if;
    update meddaily.room_players set name = v_name, last_seen_at = now() where room_code = v_code and user_id = auth.uid();
  end if;
  update meddaily.rooms set updated_at = now() where code = v_code;
  return meddaily.room_state_json(v_code);
end $$;
