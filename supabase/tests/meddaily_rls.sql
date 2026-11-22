-- Behavioural checks for the meddaily schema. Run inside a transaction that is rolled back, e.g. in the SQL editor
-- of a scratch branch, or locally against a database where the migration has been applied.
-- Each check raises an exception on failure, so a clean run means everything passed.
begin;

create or replace function pg_temp.as_user(uid uuid, anon boolean default false) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated', 'is_anonymous', anon)::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  execute 'set local role authenticated';
end $$;
create or replace function pg_temp.assert(cond boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(cond, false) then raise exception 'ASSERT FAILED: %', msg; end if; end $$;
create or replace function pg_temp.fails(sql text, expect text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then
    if sqlerrm like '%' || expect || '%' then return; end if;
    raise exception 'ASSERT FAILED: wrong error for [%]: %', sql, sqlerrm;
  end;
  raise exception 'ASSERT FAILED: expected error % for [%]', expect, sql;
end $$;

-- fixtures (as the owner)
insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'), ('00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-0000000000a3'), ('00000000-0000-0000-0000-0000000000a4')
  on conflict do nothing;

-- 1. guests can play rooms but cannot create an account
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1', true);
select pg_temp.fails($$select meddaily.ensure_profile('x')$$, 'guest_cannot_create_account');
select meddaily.join_room('abc123', 'medle', 'party', 'general', date '2026-11-22', 42, 'Ann');
select pg_temp.assert((meddaily.get_room_state('ABC123') ->> 'gameId') = 'medle', 'room created with game');

-- 2. second player joins; a mismatching join is refused; non-members cannot see the room
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', true);
select pg_temp.fails($$select meddaily.join_room('ABC123', 'hive', 'party', 'general', date '2026-11-22', 42, 'Bob')$$, 'room_mismatch');
select meddaily.join_room('abc-123', 'medle', 'party', 'general', date '2026-11-22', 42, 'Bob');
select pg_temp.assert(jsonb_array_length(meddaily.get_room_state('ABC123') -> 'players') = 2, 'two players');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a3', true);
select pg_temp.assert(meddaily.get_room_state('ABC123') is null, 'outsiders get nothing');
select pg_temp.assert((select count(*) from meddaily.rooms) = 0, 'outsiders cannot select rooms');
select pg_temp.assert((select count(*) from meddaily.room_players) = 0, 'outsiders cannot select players');
select pg_temp.fails($$insert into meddaily.rooms (code, game_id, scope, specialty, day, seed, host_id) values ('ZZZZZZ','medle','party','general',current_date,1,'00000000-0000-0000-0000-0000000000a3')$$, 'permission denied');
select pg_temp.fails($$update meddaily.room_players set score = 999$$, 'permission denied');

-- 3. scoring rules: one submission, score <= max, perfect only at max
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', true);
select pg_temp.fails($$select meddaily.submit_score('ABC123', 150, 100, false)$$, 'bad_score');
select meddaily.submit_score('ABC123', 80, 100, true);
select pg_temp.assert((select perfect from meddaily.room_players where user_id = '00000000-0000-0000-0000-0000000000a2') = false, 'perfect below max is stored as not perfect');
select pg_temp.fails($$select meddaily.submit_score('ABC123', 100, 100, true)$$, 'already_submitted');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a3', true);
select pg_temp.fails($$select meddaily.submit_score('ABC123', 1, 100, false)$$, 'not_in_room');

-- 4. capacity: eight players, the ninth is refused
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1', true);
reset role;
insert into auth.users (id) select ('00000000-0000-0000-0000-0000000001' || lpad(i::text, 2, '0'))::uuid from generate_series(1, 7) i on conflict do nothing;
insert into meddaily.room_players (room_code, user_id, name)
  select 'ABC123', ('00000000-0000-0000-0000-0000000001' || lpad(i::text, 2, '0'))::uuid, 'P' || i from generate_series(1, 6) i;
select pg_temp.as_user('00000000-0000-0000-0000-000000000107', true);
select pg_temp.fails($$select meddaily.join_room('ABC123', 'medle', 'party', 'general', date '2026-11-22', 42, 'Late')$$, 'room_full');

-- 5. leaving: host is reassigned, the last player out deletes the room
reset role;
delete from meddaily.room_players where room_code = 'ABC123' and user_id not in ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000a2');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1', true);
select meddaily.leave_room('ABC123');
reset role;
select pg_temp.assert((select host_id from meddaily.rooms where code = 'ABC123') = '00000000-0000-0000-0000-0000000000a2', 'host reassigned');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', true);
select meddaily.leave_room('ABC123');
reset role;
select pg_temp.assert((select count(*) from meddaily.rooms where code = 'ABC123') = 0, 'empty room removed');

-- 6. accounts: profile, state, results are private to their owner; entitlements are read-only for clients
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a3', false);
select meddaily.ensure_profile('Cara');
select meddaily.ensure_profile('Cara again'); -- idempotent
select pg_temp.assert((select display_name from meddaily.profiles) = 'Cara', 'profile kept');
insert into meddaily.player_state (user_id, xp) values ('00000000-0000-0000-0000-0000000000a3', 120);
insert into meddaily.results (user_id, day, game_id, scope, score, max_score) values ('00000000-0000-0000-0000-0000000000a3', date '2026-11-22', 'medle', 'general', 80, 100);
select pg_temp.fails($$insert into meddaily.results (user_id, day, game_id, scope, score, max_score) values ('00000000-0000-0000-0000-0000000000a3', date '2026-11-22', 'medle', 'general', 90, 100)$$, 'duplicate key');
select pg_temp.fails($$update meddaily.results set score = 100$$, 'permission denied');
select pg_temp.fails($$insert into meddaily.entitlements (user_id, plan, status) values ('00000000-0000-0000-0000-0000000000a3', 'pro_lifetime', 'active')$$, 'permission denied');
select pg_temp.fails($$insert into meddaily.player_state (user_id, xp) values ('00000000-0000-0000-0000-0000000000a3', 2000000000)$$, 'violates check constraint');
select pg_temp.assert(meddaily.has_pro() = false, 'free by default');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select meddaily.ensure_profile('Dan');
select pg_temp.assert((select count(*) from meddaily.profiles) = 1, 'only own profile visible');
select pg_temp.assert((select count(*) from meddaily.results) = 0, 'other people results invisible');
select pg_temp.assert((select count(*) from meddaily.player_state) = 0, 'other people state invisible');
select pg_temp.fails($$insert into meddaily.results (user_id, day, game_id, scope, score, max_score) values ('00000000-0000-0000-0000-0000000000a3', current_date, 'hive', 'general', 1, 1)$$, 'row-level security');

-- 7. entitlements written by the service role are honoured
reset role;
insert into meddaily.entitlements (user_id, plan, source, status, current_period_end)
  values ('00000000-0000-0000-0000-0000000000a4', 'pro_monthly', 'stripe', 'active', now() + interval '10 days');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select pg_temp.assert(meddaily.has_pro() = true, 'active subscription is pro');
select pg_temp.fails($$select meddaily.delete_my_account()$$, 'cancel_subscription_first');
reset role;
update meddaily.entitlements set status = 'canceled' where user_id = '00000000-0000-0000-0000-0000000000a4';
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select pg_temp.assert(meddaily.has_pro() = false, 'canceled is not pro');

-- 8. deleting a MedDaily account removes MedDaily rows only
select meddaily.delete_my_account();
reset role;
select pg_temp.assert((select count(*) from meddaily.profiles where user_id = '00000000-0000-0000-0000-0000000000a4') = 0, 'profile gone');
select pg_temp.assert((select count(*) from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a4') = 0, 'entitlement gone');
select pg_temp.assert((select count(*) from auth.users where id = '00000000-0000-0000-0000-0000000000a4') = 1, 'shared auth user untouched');

rollback;
select 'meddaily_rls: all checks passed' as result;
