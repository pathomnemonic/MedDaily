-- Stripe bookkeeping for the Roundsy checkout and webhook functions
-- (issue 165): the customer to account mapping, and the set of webhook
-- event ids already handled so a redelivered event changes nothing.
-- Mirrors the Dx pro_stripe_customers and pro_stripe_events tables.

create table meddaily.pro_stripe_customers (
  customer_id text primary key,
  user_id uuid not null references meddaily.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now()
);
create index pro_stripe_customers_user_idx on meddaily.pro_stripe_customers (user_id);
alter table meddaily.pro_stripe_customers enable row level security;
revoke all on meddaily.pro_stripe_customers from public, anon, authenticated;
grant all on meddaily.pro_stripe_customers to service_role;

create table meddaily.pro_stripe_events (
  event_id text primary key,
  kind text,
  handled_at timestamptz not null default now()
);
alter table meddaily.pro_stripe_events enable row level security;
revoke all on meddaily.pro_stripe_events from public, anon, authenticated;
grant all on meddaily.pro_stripe_events to service_role;

create or replace function meddaily.link_stripe_customer(p_customer text, p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into meddaily.pro_stripe_customers (customer_id, user_id)
  values (p_customer, p_user)
  on conflict (customer_id) do update set user_id = excluded.user_id;
  update meddaily.entitlements set provider_customer_id = p_customer, updated_at = now()
   where user_id = p_user;
end $$;

create or replace function meddaily.stripe_customer_user(p_customer text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select user_id from meddaily.pro_stripe_customers where customer_id = p_customer;
$$;

create or replace function meddaily.user_stripe_customer(p_user uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select customer_id from meddaily.pro_stripe_customers where user_id = p_user order by created_at limit 1;
$$;

-- True the first time an event id is seen, false on every redelivery.
create or replace function meddaily.stripe_event_once(p_event text, p_kind text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into meddaily.pro_stripe_events (event_id, kind) values (p_event, p_kind)
  on conflict (event_id) do nothing;
  return found;
end $$;

revoke all on function meddaily.link_stripe_customer(text, uuid) from public;
revoke all on function meddaily.stripe_customer_user(text) from public;
revoke all on function meddaily.user_stripe_customer(uuid) from public;
revoke all on function meddaily.stripe_event_once(text, text) from public;
grant execute on function meddaily.link_stripe_customer(text, uuid) to service_role;
grant execute on function meddaily.stripe_customer_user(text) to service_role;
grant execute on function meddaily.user_stripe_customer(uuid) to service_role;
grant execute on function meddaily.stripe_event_once(text, text) to service_role;
