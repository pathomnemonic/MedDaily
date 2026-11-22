-- MedDaily on the shared Supabase project.
-- Account model (confirmed): one auth identity per email/Google; "creating a MedDaily account" means creating a
-- row in meddaily.profiles. All MedDaily data, entitlements and deletion are scoped to this schema.
-- NOTHING in this file touches the public schema or any other app's schema.
--
-- Apply once, as the project owner. Afterwards add `meddaily` to Settings > API > Exposed schemas.
-- Rollback: see 20261122000001_meddaily_rollback.sql.

create schema if not exists meddaily;

grant usage on schema meddaily to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------------------------------------
create or replace function meddaily.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- True for the guest sessions created by supabase.auth.signInAnonymously().
create or replace function meddaily.is_anonymous() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
$$;

-- ---------------------------------------------------------------------------------------------------------
-- profiles: the MedDaily "account". A signed-in (non-anonymous) person creates one explicitly.
-- ---------------------------------------------------------------------------------------------------------
create table if not exists meddaily.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 20),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists profiles_touch on meddaily.profiles;
create trigger profiles_touch before update on meddaily.profiles
  for each row execute function meddaily.touch_updated_at();

create or replace function meddaily.has_profile() returns boolean
language sql stable security definer set search_path = meddaily, pg_temp as $$
  select exists (select 1 from meddaily.profiles where user_id = auth.uid())
$$;

alter table meddaily.profiles enable row level security;
drop policy if exists profiles_select_own on meddaily.profiles;
create policy profiles_select_own on meddaily.profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists profiles_update_own on meddaily.profiles;
create policy profiles_update_own on meddaily.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- inserts only through ensure_profile() so guests cannot create accounts

create or replace function meddaily.ensure_profile(p_name text default '')
returns meddaily.profiles
language plpgsql security definer set search_path = meddaily, pg_temp as $$
declare row_ meddaily.profiles;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if meddaily.is_anonymous() then raise exception 'guest_cannot_create_account' using errcode = '42501'; end if;
  insert into meddaily.profiles (user_id, display_name)
    values (auth.uid(), left(coalesce(p_name, ''), 20))
    on conflict (user_id) do nothing;
  select * into row_ from meddaily.profiles where user_id = auth.uid();
  return row_;
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- player_state: cloud copy of progress for account holders (localStorage stays the offline source of truth).
-- ---------------------------------------------------------------------------------------------------------
create table if not exists meddaily.player_state (
  user_id    uuid primary key references meddaily.profiles (user_id) on delete cascade,
  xp         integer not null default 0 check (xp between 0 and 1000000000),
  bests      jsonb   not null default '{}'::jsonb check (jsonb_typeof(bests) = 'object'),
  settings   jsonb   not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  updated_at timestamptz not null default now()
);
drop trigger if exists player_state_touch on meddaily.player_state;
create trigger player_state_touch before update on meddaily.player_state
  for each row execute function meddaily.touch_updated_at();
alter table meddaily.player_state enable row level security;
drop policy if exists player_state_select_own on meddaily.player_state;
create policy player_state_select_own on meddaily.player_state for select to authenticated using (user_id = auth.uid());
drop policy if exists player_state_insert_own on meddaily.player_state;
create policy player_state_insert_own on meddaily.player_state for insert to authenticated
  with check (user_id = auth.uid());
drop policy if exists player_state_update_own on meddaily.player_state;
create policy player_state_update_own on meddaily.player_state for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------------------------------------
-- results: one finished round per user, day, game and scope. Immutable once written.
-- ---------------------------------------------------------------------------------------------------------
create table if not exists meddaily.results (
  user_id          uuid not null references meddaily.profiles (user_id) on delete cascade,
  day              date not null,
  game_id          text not null check (char_length(game_id) between 1 and 32),
  scope            text not null default 'general' check (char_length(scope) between 1 and 32),
  score            integer not null check (score >= 0),
  max_score        integer not null check (max_score >= 0),
  perfect          boolean not null default false,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  created_at       timestamptz not null default now(),
  primary key (user_id, day, game_id, scope)
);
alter table meddaily.results enable row level security;
drop policy if exists results_select_own on meddaily.results;
create policy results_select_own on meddaily.results for select to authenticated using (user_id = auth.uid());
drop policy if exists results_insert_own on meddaily.results;
create policy results_insert_own on meddaily.results for insert to authenticated
  with check (user_id = auth.uid() and meddaily.has_profile());

-- ---------------------------------------------------------------------------------------------------------
-- entitlements: written ONLY by the service role (payment webhooks). Clients can read their own row.
-- ---------------------------------------------------------------------------------------------------------
create table if not exists meddaily.entitlements (
  user_id                  uuid primary key references meddaily.profiles (user_id) on delete cascade,
  plan                     text not null default 'free'
                           check (plan in ('free', 'pro_monthly', 'pro_quarterly', 'pro_yearly', 'pro_lifetime')),
  source                   text not null default 'manual'
                           check (source in ('stripe', 'apple', 'google', 'kofi', 'trial', 'promo', 'manual')),
  status                   text not null default 'active'
                           check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  trial_ends_at            timestamptz,
  current_period_end       timestamptz,
  provider_customer_id     text,
  provider_subscription_id text,
  updated_at               timestamptz not null default now()
);
drop trigger if exists entitlements_touch on meddaily.entitlements;
create trigger entitlements_touch before update on meddaily.entitlements
  for each row execute function meddaily.touch_updated_at();
alter table meddaily.entitlements enable row level security;
drop policy if exists entitlements_select_own on meddaily.entitlements;
create policy entitlements_select_own on meddaily.entitlements for select to authenticated using (user_id = auth.uid());
-- no insert/update/delete policies: only service_role (which bypasses RLS) may write

create or replace function meddaily.has_pro() returns boolean
language sql stable security definer set search_path = meddaily, pg_temp as $$
  select coalesce((
    select e.plan <> 'free'
       and e.status in ('active', 'trialing')
       and (e.plan = 'pro_lifetime'
            or coalesce(e.current_period_end, e.trial_ends_at, '-infinity'::timestamptz) > now())
    from meddaily.entitlements e where e.user_id = auth.uid()
  ), false)
$$;

-- ---------------------------------------------------------------------------------------------------------
-- party rooms (replace Firestore rooms/players). No direct writes: everything goes through the functions below,
-- which re-implement firestore.rules (8 players, one score per member, "perfect" only when score = max).
-- ---------------------------------------------------------------------------------------------------------
create table if not exists meddaily.rooms (
  code       text primary key check (code ~ '^[A-Z0-9]{6}$'),
  game_id    text not null check (char_length(game_id) between 1 and 32),
  scope      text not null check (char_length(scope) between 1 and 32),
  specialty  text not null check (char_length(specialty) between 1 and 32),
  day        date not null,
  seed       bigint not null,
  host_id    uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'waiting' check (status in ('waiting', 'playing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists rooms_updated_idx on meddaily.rooms (updated_at);

create table if not exists meddaily.room_players (
  room_code  text not null references meddaily.rooms (code) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'Guest' check (char_length(name) between 1 and 20),
  score      integer check (score >= 0),
  max_score  integer check (max_score >= 0),
  finished   boolean not null default false,
  perfect    boolean not null default false,
  joined_at  timestamptz not null default now(),
  primary key (room_code, user_id),
  check (score is null or max_score is null or score <= max_score),
  check (perfect = false or (score is not null and score = max_score))
);
create index if not exists room_players_user_idx on meddaily.room_players (user_id);
alter table meddaily.room_players replica identity full;

create or replace function meddaily.is_room_member(p_code text) returns boolean
language sql stable security definer set search_path = meddaily, pg_temp as $$
  select exists (select 1 from meddaily.room_players where room_code = p_code and user_id = auth.uid())
$$;

alter table meddaily.rooms enable row level security;
alter table meddaily.room_players enable row level security;
-- Members may read their room and its players (this is what lets Realtime deliver changes to them).
drop policy if exists rooms_select_member on meddaily.rooms;
create policy rooms_select_member on meddaily.rooms for select to authenticated using (meddaily.is_room_member(code));
drop policy if exists room_players_select_member on meddaily.room_players;
create policy room_players_select_member on meddaily.room_players for select to authenticated
  using (meddaily.is_room_member(room_code));

create or replace function meddaily.room_state_json(p_code text) returns jsonb
language sql stable security definer set search_path = meddaily, pg_temp as $$
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

create or replace function meddaily.get_room_state(p_code text) returns jsonb
language plpgsql stable security definer set search_path = meddaily, pg_temp as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if not meddaily.is_room_member(upper(p_code)) then return null; end if;
  return meddaily.room_state_json(upper(p_code));
end $$;

create or replace function meddaily.join_room(
  p_code text, p_game_id text, p_scope text, p_specialty text, p_day date, p_seed bigint, p_name text
) returns jsonb
language plpgsql security definer set search_path = meddaily, pg_temp as $$
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
language plpgsql security definer set search_path = meddaily, pg_temp as $$
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

create or replace function meddaily.leave_room(p_code text) returns void
language plpgsql security definer set search_path = meddaily, pg_temp as $$
declare v_code text := upper(p_code); v_host uuid;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  delete from meddaily.room_players where room_code = v_code and user_id = auth.uid();
  if not found then return; end if;
  if not exists (select 1 from meddaily.room_players where room_code = v_code) then
    delete from meddaily.rooms where code = v_code;
    return;
  end if;
  select host_id into v_host from meddaily.rooms where code = v_code;
  if v_host = auth.uid() then
    update meddaily.rooms
       set host_id = (select user_id from meddaily.room_players where room_code = v_code order by joined_at limit 1),
           updated_at = now()
     where code = v_code;
  else
    update meddaily.rooms set updated_at = now() where code = v_code;
  end if;
end $$;

-- Rooms are ephemeral. Schedule with pg_cron (see the API contract) or call from a scheduled function.
create or replace function meddaily.cleanup_rooms() returns integer
language plpgsql security definer set search_path = meddaily, pg_temp as $$
declare n integer;
begin
  delete from meddaily.rooms where updated_at < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- per-app account deletion: removes MedDaily data only. The shared auth user is NOT touched here; deleting the
-- auth identity is a cross-app decision (only when no other app still holds a profile for that user).
-- ---------------------------------------------------------------------------------------------------------
create or replace function meddaily.delete_my_account() returns void
language plpgsql security definer set search_path = meddaily, pg_temp as $$
declare e meddaily.entitlements;
begin
  if auth.uid() is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  select * into e from meddaily.entitlements where user_id = auth.uid();
  if found and e.plan <> 'free' and e.status in ('active', 'trialing', 'past_due')
     and e.source in ('stripe', 'apple', 'google') and e.plan <> 'pro_lifetime' then
    raise exception 'cancel_subscription_first' using errcode = '55000',
      hint = 'Cancel the active subscription with its provider before deleting the account.';
  end if;
  delete from meddaily.room_players where user_id = auth.uid();
  delete from meddaily.rooms r where not exists (select 1 from meddaily.room_players p where p.room_code = r.code);
  delete from meddaily.profiles where user_id = auth.uid(); -- cascades results, player_state, entitlements
end $$;

-- ---------------------------------------------------------------------------------------------------------
-- privileges: deny by default, then grant exactly what the client may do.
-- ---------------------------------------------------------------------------------------------------------
revoke all on all tables in schema meddaily from anon, authenticated;
revoke all on all functions in schema meddaily from public, anon, authenticated;

grant select on meddaily.profiles, meddaily.player_state, meddaily.results, meddaily.entitlements,
                meddaily.rooms, meddaily.room_players to authenticated;
grant update (display_name) on meddaily.profiles to authenticated;
grant insert, update on meddaily.player_state to authenticated;
grant insert on meddaily.results to authenticated;
grant all on all tables in schema meddaily to service_role;

grant execute on function
  meddaily.ensure_profile(text), meddaily.has_pro(), meddaily.has_profile(), meddaily.is_anonymous(),
  meddaily.is_room_member(text),
  meddaily.get_room_state(text),
  meddaily.join_room(text, text, text, text, date, bigint, text),
  meddaily.submit_score(text, integer, integer, boolean),
  meddaily.leave_room(text),
  meddaily.delete_my_account()
  to authenticated;
grant execute on function meddaily.cleanup_rooms() to service_role;
grant execute on all functions in schema meddaily to service_role;

-- Realtime: members receive changes to their room and its players (filtered by row-level security).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table meddaily.rooms; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table meddaily.room_players; exception when duplicate_object then null; end;
  end if;
end $$;
