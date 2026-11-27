-- Rollback for 20261127000001_meddaily_room_lifecycle_fixes.sql (issues 142 to 145).
-- Restores the prior function bodies verbatim and the two-value rooms status
-- check. Rooms stamped finished are set back to playing first, since the old
-- check does not allow that value; their completion becomes derived again,
-- with the reopening behavior of issue 143.

update meddaily.rooms set status = 'playing' where status = 'finished';
alter table meddaily.rooms drop constraint if exists rooms_status_check;
alter table meddaily.rooms
  add constraint rooms_status_check check (status in ('waiting', 'playing'));

create or replace function meddaily.room_is_over(p_code text) returns boolean
language sql stable security definer set search_path = '' as $$
  select count(*) >= 2 and bool_and(p.finished)
    from meddaily.room_players p
   where p.room_code = p_code and (p.finished or p.last_seen_at > now() - interval '5 minutes')
$$;

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

create or replace function meddaily.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  e meddaily.entitlements;
  my_rooms text[];
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select * into e from meddaily.entitlements where user_id = auth.uid();
  if found and e.plan <> 'free' and e.status in ('active', 'trialing', 'past_due')
     and e.source in ('stripe', 'apple', 'google') and e.plan <> 'pro_lifetime' then
    raise exception 'cancel_subscription_first' using errcode = '55000',
      hint = 'Cancel the active subscription with its provider before deleting the account.';
  end if;
  select coalesce(array_agg(room_code), '{}') into my_rooms from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.rooms r
   where r.code = any (my_rooms)
     and not exists (select 1 from meddaily.room_players p where p.room_code = r.code);
  delete from meddaily.profiles where user_id = auth.uid(); -- cascades results, player_state, entitlements
end $$;
