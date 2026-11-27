-- Rollback for 20261128030000_meddaily_stripe_bookkeeping.sql (issue 165).
drop function if exists meddaily.stripe_event_once(text, text);
drop function if exists meddaily.user_stripe_customer(uuid);
drop function if exists meddaily.stripe_customer_user(text);
drop function if exists meddaily.link_stripe_customer(text, uuid);
drop table if exists meddaily.pro_stripe_events;
drop table if exists meddaily.pro_stripe_customers;
