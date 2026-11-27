-- Issue 149: room lifecycle round two, from the Nov 26 panel code pass
-- (Claude) verification. One migration because the fixes interlock in the
-- same room functions.
--
-- Presence lockout: an existing member who lost presence for over 5 minutes
-- while the room finished could not rejoin, heartbeat, or record a late
-- score. Existing members may now do all three in a finished room. New
-- members stay refused, and rooms.status stays finished once stamped.
-- Solo rooms: the derived branch of room_is_over now counts a room as over
-- when at least one player is active and every active player has finished,
-- so a one player room can finish.
-- leave_room keeps a finished player's row, so their score stays on the
-- results. Unfinished rows delete as before.
-- Host liveness: leave_room host reassignment picks the earliest active
-- joiner (finished or seen within 5 minutes) when one exists, and
-- cleanup_rooms reassigns host_id for surviving rooms whose host is no
-- longer an active player.
-- rooms.status moves from waiting to playing when a second member joins a
-- waiting room.
-- submit_score, leave_room, touch_room and get_room_state now normalize the
-- room code exactly as join_room does (strip non alphanumerics, uppercase).
-- cleanup_rooms returns the total rows removed (players plus rooms).
-- meddaily.touch_updated_at gets its search_path pinned, like the rest.

create or replace function meddaily.room_is_over(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select r.status = 'finished' from meddaily.rooms r where r.code = p_code), false)
      or coalesce((select count(*) >= 1 and bool_and(p.finished)
                     from meddaily.room_players p
                    where p.room_code = p_code
                      and (p.finished or p.last_seen_at > now() - interval '5 minutes')), false)
$$;

create or replace function meddaily.touch_room(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_room_finished boolean;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select status = 'finished' into v_room_finished from meddaily.rooms where code = v_code;
  v_room_finished := coalesce(v_room_finished, false);
  update meddaily.room_players p set last_seen_at = now()
   where p.room_code = v_code and p.user_id = auth.uid()
     -- members of a finished room may keep heartbeating to read results,
     -- even when they have not finished themselves (issue 149)
     and (p.finished or v_room_finished or not meddaily.room_is_over(v_code))
     -- a stale unfinished member reactivating takes a seat again: refuse the
     -- heartbeat when the room is already at capacity without them (issue 142).
     -- A finished room takes no new seats, so it is exempt.
     and (p.finished or v_room_finished
          or p.last_seen_at > now() - interval '5 minutes'
          or (select count(*) from meddaily.room_players o
               where o.room_code = v_code and o.user_id <> auth.uid()
                 and (o.finished or o.last_seen_at > now() - interval '5 minutes')) < 8);
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
  v_seen timestamptz;
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

  select true, coalesce(finished, false), last_seen_at into v_member, v_done, v_seen
    from meddaily.room_players where room_code = v_code and user_id = auth.uid();
  v_member := coalesce(v_member, false);
  if not v_member then
    if meddaily.room_is_over(v_code) then raise exception 'room_finished' using errcode = '55000'; end if;
    select count(*) into v_count from meddaily.room_players
     where room_code = v_code and (finished or last_seen_at > now() - interval '5 minutes');
    if v_count >= 8 then raise exception 'room_full' using errcode = '53400'; end if;
    insert into meddaily.room_players (room_code, user_id, name) values (v_code, auth.uid(), v_name);
  else
    -- an existing member may always come back, including to a finished room
    -- to read the results; only new members are refused there (issue 149)
    -- a stale unfinished member takes a seat again on return, so capacity
    -- applies to them exactly as it does to a new member (issue 142).
    -- A finished room takes no new seats, so it is exempt.
    if not v_done and v_room.status <> 'finished' and v_seen <= now() - interval '5 minutes' then
      select count(*) into v_count from meddaily.room_players
       where room_code = v_code and user_id <> auth.uid()
         and (finished or last_seen_at > now() - interval '5 minutes');
      if v_count >= 8 then raise exception 'room_full' using errcode = '53400'; end if;
    end if;
    update meddaily.room_players set name = v_name, last_seen_at = now() where room_code = v_code and user_id = auth.uid();
  end if;
  -- a waiting room starts playing when its second member joins (issue 149)
  update meddaily.rooms
     set status = case when status = 'waiting'
                        and (select count(*) from meddaily.room_players where room_code = v_code) >= 2
                       then 'playing' else status end,
         updated_at = now()
   where code = v_code;
  return meddaily.room_state_json(v_code);
end $$;

create or replace function meddaily.submit_score(p_code text, p_score integer, p_max integer, p_perfect boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_game text;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if p_score is null or p_max is null or p_score < 0 or p_max < 0 then
    raise exception 'bad_score' using errcode = '22023';
  end if;
  -- lock the room row first, matching join_room, so a completion check here
  -- and an admission there cannot both see the room as open (issue 145)
  select game_id into v_game from meddaily.rooms where code = v_code for update;
  if p_score > p_max and not (v_game = 'splice' and p_score <= 1000000) then
    raise exception 'bad_score' using errcode = '22023';
  end if;
  -- no room_finished refusal here: an existing member who has not finished
  -- may record a late score in a finished room (issue 149). Callers who are
  -- not members fall through to not_in_room below, and new members are
  -- refused at join time, so the room never reopens.
  update meddaily.room_players
     set score = p_score, max_score = p_max, perfect = (coalesce(p_perfect, false) and p_score >= p_max),
         finished = true, last_seen_at = now()
   where room_code = v_code and user_id = auth.uid() and finished = false;
  if not found then
    if meddaily.is_room_member(v_code) then raise exception 'already_submitted' using errcode = '23505'; end if;
    raise exception 'not_in_room' using errcode = '42501';
  end if;
  -- persist completion so the room stays finished even if a player then
  -- leaves (issue 143). A room already stamped finished stays finished,
  -- because room_is_over honors the stamp.
  update meddaily.rooms
     set status = case when meddaily.room_is_over(v_code) then 'finished' else 'playing' end,
         updated_at = now()
   where code = v_code;
end $$;

create or replace function meddaily.leave_room(p_code text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_host uuid;
  v_finished boolean;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select finished into v_finished from meddaily.room_players where room_code = v_code and user_id = auth.uid();
  if not found then return; end if;
  if v_finished then
    -- a finished player keeps their row, so their score stays on the
    -- results for the players still in the room (issue 149)
    update meddaily.rooms set updated_at = now() where code = v_code;
    return;
  end if;
  delete from meddaily.room_players where room_code = v_code and user_id = auth.uid();
  if not exists (select 1 from meddaily.room_players where room_code = v_code) then
    delete from meddaily.rooms where code = v_code;
    return;
  end if;
  select host_id into v_host from meddaily.rooms where code = v_code;
  if v_host = auth.uid() then
    update meddaily.rooms
       set host_id = coalesce(
             (select user_id from meddaily.room_players
               where room_code = v_code
                 and (finished or last_seen_at > now() - interval '5 minutes')
               order by joined_at limit 1),
             (select user_id from meddaily.room_players where room_code = v_code order by joined_at limit 1)),
           updated_at = now()
     where code = v_code;
  else
    update meddaily.rooms set updated_at = now() where code = v_code;
  end if;
end $$;

create or replace function meddaily.get_room_state(p_code text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if not meddaily.is_room_member(v_code) then return null; end if;
  return meddaily.room_state_json(v_code);
end $$;

-- Rooms idle for a day go; so do unfinished players who vanished more than an hour ago.
create or replace function meddaily.cleanup_rooms() returns integer
language plpgsql security definer set search_path = '' as $$
declare n integer; p integer;
begin
  delete from meddaily.room_players where finished = false and last_seen_at < now() - interval '1 hour';
  get diagnostics p = row_count;
  -- a surviving room whose host is no longer an active player gets the
  -- earliest active joiner as host (issue 149)
  update meddaily.rooms r
     set host_id = (select pl.user_id from meddaily.room_players pl
                     where pl.room_code = r.code
                       and (pl.finished or pl.last_seen_at > now() - interval '5 minutes')
                     order by pl.joined_at limit 1)
   where exists (select 1 from meddaily.room_players pl
                  where pl.room_code = r.code
                    and (pl.finished or pl.last_seen_at > now() - interval '5 minutes'))
     and not exists (select 1 from meddaily.room_players pl
                      where pl.room_code = r.code and pl.user_id = r.host_id
                        and (pl.finished or pl.last_seen_at > now() - interval '5 minutes'));
  delete from meddaily.rooms where updated_at < now() - interval '24 hours'
     or not exists (select 1 from meddaily.room_players pl where pl.room_code = code);
  get diagnostics n = row_count;
  return p + n;
end $$;

alter function meddaily.touch_updated_at() set search_path = '';
