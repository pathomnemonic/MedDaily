-- Behavioural checks for the meddaily schema. Run inside a transaction that is rolled back, e.g. in the SQL editor
-- of a scratch branch, or locally against a database where the migration has been applied.
-- Each check raises an exception on failure, so a clean run means everything passed.
-- Stop on the first error: without this, psql continues past a failed assert, the closing rollback still
-- succeeds, and the success line at the end prints anyway, so a failing run can look green (issue 152).
\set ON_ERROR_STOP on
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

-- 7b. deleting an account must not remove other people's empty rooms
reset role;
insert into meddaily.rooms (code, game_id, scope, specialty, day, seed, host_id) values ('EMPTY1', 'medle', 'party', 'general', current_date, 1, '00000000-0000-0000-0000-0000000000a1');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);

-- 8. deleting a MedDaily account removes MedDaily rows only
select meddaily.delete_my_account();
reset role;
select pg_temp.assert((select count(*) from meddaily.profiles where user_id = '00000000-0000-0000-0000-0000000000a4') = 0, 'profile gone');
select pg_temp.assert((select count(*) from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a4') = 0, 'entitlement gone');
select pg_temp.assert((select count(*) from auth.users where id = '00000000-0000-0000-0000-0000000000a4') = 1, 'shared auth user untouched');
select pg_temp.assert((select count(*) from meddaily.rooms where code = 'EMPTY1') = 1, 'unrelated empty room survives account deletion');

-- 9. rooms lifecycle (20261123000002): stale players hide, finished rooms close
reset role;
insert into meddaily.rooms (code, game_id, scope, specialty, day, seed, host_id) values ('LIFE01', 'medle', 'party', 'general', current_date, 1, '00000000-0000-0000-0000-0000000000a1');
insert into meddaily.room_players (room_code, user_id, name, last_seen_at) values
  ('LIFE01', '00000000-0000-0000-0000-0000000000a1', 'One', now()),
  ('LIFE01', '00000000-0000-0000-0000-0000000000a2', 'Two', now()),
  ('LIFE01', '00000000-0000-0000-0000-0000000000a3', 'Gone', now() - interval '10 minutes');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1', false);
select pg_temp.assert(jsonb_array_length(meddaily.get_room_state('LIFE01')->'players') = 2, 'stale unfinished player is hidden');
select meddaily.touch_room('LIFE01');
select meddaily.submit_score('LIFE01', 5, 10, false);
select pg_temp.assert(meddaily.get_room_state('LIFE01')->>'status' = 'playing', 'room still open while someone is playing');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', false);
select meddaily.submit_score('LIFE01', 6, 10, false);
select pg_temp.assert(meddaily.get_room_state('LIFE01')->>'status' = 'finished', 'room finished when all active players are done');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a3', false);
-- round two (20261127000002): an existing member may come back to a finished
-- room, heartbeat, and record a late score; the room stays finished
select meddaily.join_room('LIFE01', 'medle', 'party', 'general', current_date, 1, 'Gone');
select pg_temp.assert(meddaily.get_room_state('LIFE01')->>'status' = 'finished', 'a stale member rejoining does not reopen a finished room');
select meddaily.touch_room('LIFE01');
select pg_temp.assert(meddaily.get_room_state('LIFE01')->>'status' = 'finished', 'heartbeat from a stale member does not reopen a finished room');
select meddaily.submit_score('LIFE01', 1, 10, false);
select pg_temp.assert((select score from meddaily.room_players where room_code = 'LIFE01' and user_id = '00000000-0000-0000-0000-0000000000a3') = 1, 'late score from a stale member is recorded');
select pg_temp.assert((select finished from meddaily.room_players where room_code = 'LIFE01' and user_id = '00000000-0000-0000-0000-0000000000a3') = true, 'late score marks the stale member finished');
select pg_temp.assert(meddaily.get_room_state('LIFE01')->>'status' = 'finished', 'room stays finished after a late score');
reset role;
select pg_temp.assert(meddaily.room_is_over('LIFE01') = true, 'room_is_over stays true after a late score');
select pg_temp.assert((select status from meddaily.rooms where code = 'LIFE01') = 'finished', 'rooms.status stays finished after a late score');
-- a brand new member is still refused, and the room stays finished
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select pg_temp.fails($$select meddaily.join_room('LIFE01', 'medle', 'party', 'general', current_date, 1, 'Late')$$, 'room_finished');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', false);
select meddaily.join_room('LIFE01', 'medle', 'party', 'general', current_date, 1, 'Two');
select pg_temp.assert(meddaily.get_room_state('LIFE01')->>'status' = 'finished', 'a finished member may rejoin to read results');
reset role;
delete from meddaily.rooms where code = 'LIFE01';

-- 10. endless sprint scores (20261126000000): Splice Sprint has no score cap, so a
-- score above the reported 240 target is accepted in a splice room only
reset role;
insert into meddaily.rooms (code, game_id, scope, specialty, day, seed, host_id) values ('SPLI01', 'splice', 'party', 'general', current_date, 1, '00000000-0000-0000-0000-0000000000a1');
insert into meddaily.room_players (room_code, user_id, name, last_seen_at) values
  ('SPLI01', '00000000-0000-0000-0000-0000000000a1', 'One', now()),
  ('SPLI01', '00000000-0000-0000-0000-0000000000a2', 'Two', now());
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a1', false);
select meddaily.submit_score('SPLI01', 300, 240, true);
select pg_temp.assert((select score from meddaily.room_players where room_code = 'SPLI01' and user_id = '00000000-0000-0000-0000-0000000000a1') = 300, 'sprint score above the target is stored');
select pg_temp.assert((select perfect from meddaily.room_players where room_code = 'SPLI01' and user_id = '00000000-0000-0000-0000-0000000000a1') = true, 'reaching the sprint target stores perfect');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', false);
select pg_temp.fails($$select meddaily.submit_score('SPLI01', 1000001, 240, false)$$, 'bad_score');
reset role;
delete from meddaily.rooms where code = 'SPLI01';

-- 11. Pro plumbing (20261128000000): the trial is once per account and the
-- ledger survives account deletion; archive writes need current Pro
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', true);
select pg_temp.fails($$select meddaily.start_trial()$$, 'guest_cannot_start_trial');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select pg_temp.fails($$select meddaily.start_trial()$$, 'no_profile');
select meddaily.ensure_profile('Pro');
select meddaily.start_trial();
select pg_temp.assert(meddaily.has_pro(), 'trial grants Pro');
select pg_temp.assert((select status from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a4') = 'trialing', 'trial row is trialing');
select pg_temp.assert((select trial_ends_at > now() + interval '6 days' from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a4'), 'trial runs seven days');
select pg_temp.fails($$select meddaily.start_trial()$$, 'trial_already_used');
insert into meddaily.results (user_id, day, game_id, scope, score, max_score, perfect, duration_seconds, archive)
  values ('00000000-0000-0000-0000-0000000000a4', date '2026-11-20', 'medle', 'general', 10, 10, true, 60, true);
reset role;
update meddaily.entitlements set status = 'expired', trial_ends_at = now() - interval '1 day' where user_id = '00000000-0000-0000-0000-0000000000a4';
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select pg_temp.assert(not meddaily.has_pro(), 'expired trial is not Pro');
select pg_temp.fails($$insert into meddaily.results (user_id, day, game_id, scope, score, max_score, perfect, duration_seconds, archive) values ('00000000-0000-0000-0000-0000000000a4', date '2026-11-19', 'medle', 'general', 5, 10, false, 30, true)$$, 'row-level security');
select meddaily.delete_my_account();
reset role;
select pg_temp.assert((select count(*) from meddaily.trial_ledger where user_id = '00000000-0000-0000-0000-0000000000a4') = 1, 'ledger survives account deletion');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select meddaily.ensure_profile('Pro again');
select pg_temp.fails($$select meddaily.start_trial()$$, 'trial_already_used');
reset role;

-- 12. Trial availability (20261128010000): mirrors the start_trial gates
-- without starting anything
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a4', false);
select pg_temp.assert(not meddaily.trial_available(), 'trial no longer available after use');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a3', true);
select pg_temp.assert(not meddaily.trial_available(), 'trial unavailable to guests');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a3', false);
select meddaily.ensure_profile('Third');
select pg_temp.assert(meddaily.trial_available(), 'trial available to a fresh account');
select meddaily.start_trial();
select pg_temp.assert(not meddaily.trial_available(), 'trial unavailable while trialing');
reset role;

-- 13. Pro grants (20261128020000): the summary is rebuilt from per source
-- grants, and a store purchase belongs to one account only
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', false);
select meddaily.ensure_profile('Second');
reset role;
select meddaily.grant_pro('00000000-0000-0000-0000-0000000000a2', 'pro_monthly', 'apple', 'active', now() + interval '30 days');
select pg_temp.as_user('00000000-0000-0000-0000-0000000000a2', false);
select pg_temp.assert(meddaily.has_pro(), 'apple grant gives Pro');
reset role;
select meddaily.grant_pro('00000000-0000-0000-0000-0000000000a2', 'pro_yearly', 'stripe', 'active', now() + interval '365 days');
select meddaily.grant_pro('00000000-0000-0000-0000-0000000000a2', 'pro_monthly', 'google', 'active', now() + interval '10 days');
select pg_temp.assert((select source from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a2') = 'stripe', 'longest grant wins the summary');
select meddaily.revoke_pro_source('00000000-0000-0000-0000-0000000000a2', 'stripe');
select pg_temp.assert((select source from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a2') = 'apple', 'revoking one source reveals the grant underneath');
select meddaily.revoke_pro_source('00000000-0000-0000-0000-0000000000a2', 'apple');
select meddaily.revoke_pro_source('00000000-0000-0000-0000-0000000000a2', 'google');
select pg_temp.assert(not exists (select 1 from meddaily.entitlements where user_id = '00000000-0000-0000-0000-0000000000a2'), 'summary removed when no grants remain');
select pg_temp.assert(meddaily.claim_store_purchase('ios', 'suite-key', '00000000-0000-0000-0000-0000000000a2', 'roundsy_pro_yearly', now() + interval '365 days', false) = 'ok', 'first store claim ok');
select pg_temp.assert(meddaily.claim_store_purchase('ios', 'suite-key', '00000000-0000-0000-0000-0000000000a4', 'roundsy_pro_yearly', now() + interval '365 days', false) = 'other_account', 'another account cannot claim the same purchase');
reset role;

rollback;
select 'meddaily_rls: all checks passed' as result;
