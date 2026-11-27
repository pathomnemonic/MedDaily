-- Per source Pro grants, store purchase claims, and a grant based trial
-- (issue 165). meddaily.entitlements stays the single summary row the
-- client reads and meddaily.has_pro() judges, but it is now rebuilt from
-- meddaily.pro_grants, one row per user and source, so revoking one
-- source (a store refund, say) can never erase a grant from another
-- source underneath it. This mirrors the grants plus summary shape the
-- Dx Dash billing SQL uses in the public schema.

create table meddaily.pro_grants (
  user_id uuid not null references meddaily.profiles(user_id) on delete cascade,
  source text not null check (source in ('stripe', 'apple', 'google', 'kofi', 'trial', 'promo', 'manual')),
  plan text not null check (plan in ('free', 'pro_monthly', 'pro_quarterly', 'pro_yearly', 'pro_lifetime')),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'expired')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, source)
);
alter table meddaily.pro_grants enable row level security;
revoke all on meddaily.pro_grants from public, anon, authenticated;
grant all on meddaily.pro_grants to service_role;

create table meddaily.pro_store_purchases (
  platform text not null check (platform in ('ios', 'android')),
  store_key text not null,
  user_id uuid not null references meddaily.profiles(user_id) on delete cascade,
  product_id text not null,
  expires_at timestamptz,
  revoked boolean not null default false,
  verified_at timestamptz not null default now(),
  primary key (platform, store_key)
);
alter table meddaily.pro_store_purchases enable row level security;
revoke all on meddaily.pro_store_purchases from public, anon, authenticated;
grant all on meddaily.pro_store_purchases to service_role;

-- Rebuilds the entitlements summary from the grants: the qualifying grant
-- with the longest run wins, where qualifying mirrors has_pro() exactly.
-- Provider ids on the summary are left untouched; they belong to the
-- billing mapping, not to any single grant.
create or replace function meddaily.recompute_entitlement(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  g meddaily.pro_grants;
  qualifies boolean;
begin
  select * into g from meddaily.pro_grants pg
   where pg.user_id = p_user
   order by
     (pg.plan <> 'free' and pg.status in ('active', 'trialing', 'past_due')
       and (pg.plan = 'pro_lifetime'
            or coalesce(pg.current_period_end, pg.trial_ends_at, '-infinity'::timestamptz) > now()
            or (pg.current_period_end is null and pg.trial_ends_at is null and pg.source in ('manual', 'promo')))) desc,
     (case when pg.plan = 'pro_lifetime' then 'infinity'::timestamptz
           when pg.current_period_end is null and pg.trial_ends_at is null and pg.source in ('manual', 'promo') then 'infinity'::timestamptz
           else coalesce(pg.current_period_end, pg.trial_ends_at, '-infinity'::timestamptz) end) desc,
     pg.updated_at desc
   limit 1;
  if not found then
    delete from meddaily.entitlements where user_id = p_user;
    return;
  end if;
  qualifies := g.plan <> 'free' and g.status in ('active', 'trialing', 'past_due')
    and (g.plan = 'pro_lifetime'
         or coalesce(g.current_period_end, g.trial_ends_at, '-infinity'::timestamptz) > now()
         or (g.current_period_end is null and g.trial_ends_at is null and g.source in ('manual', 'promo')));
  insert into meddaily.entitlements (user_id, plan, source, status, trial_ends_at, current_period_end)
  values (p_user, g.plan, g.source, case when qualifies then g.status else 'expired' end, g.trial_ends_at, g.current_period_end)
  on conflict (user_id) do update set
    plan = excluded.plan, source = excluded.source, status = excluded.status,
    trial_ends_at = excluded.trial_ends_at, current_period_end = excluded.current_period_end,
    updated_at = now();
end $$;

-- Grants or replaces one source of Pro, then rebuilds the summary.
create or replace function meddaily.grant_pro(p_user uuid, p_plan text, p_source text, p_status text, p_period_end timestamptz default null, p_trial_ends timestamptz default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into meddaily.pro_grants (user_id, source, plan, status, trial_ends_at, current_period_end)
  values (p_user, p_source, p_plan, p_status, p_trial_ends, p_period_end)
  on conflict (user_id, source) do update set
    plan = excluded.plan, status = excluded.status,
    trial_ends_at = excluded.trial_ends_at, current_period_end = excluded.current_period_end,
    updated_at = now();
  perform meddaily.recompute_entitlement(p_user);
end $$;

-- Removes one source of Pro, then rebuilds the summary from what remains.
create or replace function meddaily.revoke_pro_source(p_user uuid, p_source text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from meddaily.pro_grants where user_id = p_user and source = p_source;
  perform meddaily.recompute_entitlement(p_user);
end $$;

-- Records a store purchase checked with the store itself and enforces one
-- purchase per account. Returns 'ok' for a new claim or the same account
-- again, and 'other_account' when a different account already holds it.
create or replace function meddaily.claim_store_purchase(p_platform text, p_key text, p_user uuid, p_product text, p_expires timestamptz, p_revoked boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing meddaily.pro_store_purchases;
begin
  insert into meddaily.pro_store_purchases (platform, store_key, user_id, product_id, expires_at, revoked)
  values (p_platform, p_key, p_user, p_product, p_expires, coalesce(p_revoked, false))
  on conflict (platform, store_key) do nothing;
  select * into existing from meddaily.pro_store_purchases
   where platform = p_platform and store_key = p_key for update;
  if existing.user_id <> p_user then return 'other_account'; end if;
  update meddaily.pro_store_purchases
     set product_id = p_product, expires_at = p_expires, revoked = coalesce(p_revoked, false), verified_at = now()
   where platform = p_platform and store_key = p_key;
  return 'ok';
end $$;

revoke all on function meddaily.recompute_entitlement(uuid) from public;
revoke all on function meddaily.grant_pro(uuid, text, text, text, timestamptz, timestamptz) from public;
revoke all on function meddaily.revoke_pro_source(uuid, text) from public;
revoke all on function meddaily.claim_store_purchase(text, text, uuid, text, timestamptz, boolean) from public;
grant execute on function meddaily.recompute_entitlement(uuid) to service_role;
grant execute on function meddaily.grant_pro(uuid, text, text, text, timestamptz, timestamptz) to service_role;
grant execute on function meddaily.revoke_pro_source(uuid, text) to service_role;
grant execute on function meddaily.claim_store_purchase(text, text, uuid, text, timestamptz, boolean) to service_role;

-- The trial now lands as a grant like every other source, so the summary
-- the player sees is the recomputed one. The guards and the once only
-- ledger are unchanged from 20261128000000. One deliberate difference:
-- starting a trial no longer clears the provider ids on the summary,
-- because the Stripe customer mapping must survive a later trial.
create or replace function meddaily.start_trial()
returns meddaily.entitlements
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  e meddaily.entitlements;
begin
  if uid is null then raise exception 'not_signed_in' using errcode = '28000'; end if;
  if meddaily.is_anonymous() then
    raise exception 'guest_cannot_start_trial' using errcode = '55000',
      hint = 'Sign in with a real account to start the free trial.';
  end if;
  if not meddaily.has_profile() then
    raise exception 'no_profile' using errcode = '55000',
      hint = 'Create the Roundsy profile before starting the trial.';
  end if;
  if exists (select 1 from meddaily.trial_ledger l where l.user_id = uid) then
    raise exception 'trial_already_used' using errcode = '55000',
      hint = 'The free trial is once per account.';
  end if;
  select * into e from meddaily.entitlements where user_id = uid;
  if found and e.plan <> 'free' and e.status in ('active', 'trialing', 'past_due') then
    raise exception 'already_subscribed' using errcode = '55000',
      hint = 'This account already has Pro.';
  end if;
  insert into meddaily.trial_ledger (user_id) values (uid);
  perform meddaily.grant_pro(uid, 'pro_yearly', 'trial', 'trialing', null, now() + interval '7 days');
  select * into e from meddaily.entitlements where user_id = uid;
  return e;
end $$;
