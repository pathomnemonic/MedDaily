// roundsy-stripe-webhook — Stripe tells us a payment happened; this turns it into Pro in meddaily.
//
// Deploy:  supabase functions deploy roundsy-stripe-webhook --no-verify-jwt
// Secrets: ROUNDSY_STRIPE_SECRET_KEY, ROUNDSY_STRIPE_WEBHOOK_SECRET (Roundsy specific names, because this Supabase
// project is shared with the other apps; every Stripe webhook endpoint has its own signing secret)
// In Stripe: Developers -> Webhooks -> add https://<project>.supabase.co/functions/v1/roundsy-stripe-webhook and send
//   checkout.session.completed, checkout.session.async_payment_succeeded, invoice.paid, invoice.payment_succeeded,
//   charge.refunded, charge.dispute.created, charge.dispute.updated, charge.dispute.closed and
//   customer.subscription.deleted.
// Every request is checked against the webhook signing secret first; anything unsigned is refused. Handled events
// are recorded once in meddaily.pro_stripe_events, and every grant is a replace of the stripe source, so a
// redelivered event changes nothing.
// Ported from the Dx Dash stripe-webhook function.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';
import { verifyStripeSignature, handleEvent, chargeReturned } from '../_shared/roundsy-billing.js';

var STRIPE_KEY = Deno.env.get('ROUNDSY_STRIPE_SECRET_KEY') || '';
var SIGNING_SECRET = Deno.env.get('ROUNDSY_STRIPE_WEBHOOK_SECRET') || '';
var db = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', { auth: { persistSession: false }, db: { schema: 'meddaily' } });

async function getSubscription(id) {
  var res = await fetch('https://api.stripe.com/v1/subscriptions/' + encodeURIComponent(id), { headers: { Authorization: 'Bearer ' + STRIPE_KEY } });
  if (!res.ok) throw new Error('Stripe said ' + res.status + ' for the subscription');
  return res.json();
}

async function stripeGet(path) {
  var res = await fetch('https://api.stripe.com/v1/' + path, { headers: { Authorization: 'Bearer ' + STRIPE_KEY } });
  if (!res.ok) throw new Error('Stripe said ' + res.status + ' for ' + path.split('?')[0]);
  return res.json();
}
function getCharge(id) { return stripeGet('charges/' + encodeURIComponent(id) + '?expand[]=dispute'); }
async function listSubscriptions(customer) { var r = await stripeGet('subscriptions?customer=' + encodeURIComponent(customer) + '&status=all&limit=10'); return (r && r.data) || []; }
function getInvoice(id) { return stripeGet('invoices/' + encodeURIComponent(id)); }
/** Has this payment already been refunded, or is it in dispute? (A late "completed" event must not hand it back.) */
async function isPaymentReturned(paymentIntentId) {
  var pi = await stripeGet('payment_intents/' + encodeURIComponent(paymentIntentId) + '?expand[]=latest_charge.dispute');
  return chargeReturned(pi && pi.latest_charge);
}

/** Records the Stripe subscription id on the entitlement summary, for support lookups. */
async function setSubscriptionRef(userId, customerId, subscriptionId) {
  var patch = { provider_subscription_id: subscriptionId, updated_at: new Date().toISOString() };
  if (customerId) patch.provider_customer_id = customerId;
  var r = await db.from('entitlements').update(patch).eq('user_id', userId);
  if (r.error) throw new Error(r.error.message);
}

async function rpc(name, args) {
  var r = await db.rpc(name, args);
  if (r.error) throw new Error(name + ': ' + r.error.message);
  return r.data;
}

Deno.serve(async function (req) {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  var raw = await req.text();
  var now = Math.floor(Date.now() / 1000);
  if (!(await verifyStripeSignature(raw, req.headers.get('stripe-signature'), SIGNING_SECRET, now))) return new Response('bad signature', { status: 400 });
  var event;
  try { event = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  try {
    var first = await rpc('stripe_event_once', { p_event: event.id, p_kind: event.type });
    var out = await handleEvent(event, { rpc: rpc, getSubscription: getSubscription, getCharge: getCharge, getInvoice: getInvoice, listSubscriptions: listSubscriptions, isPaymentReturned: isPaymentReturned, setSubscriptionRef: setSubscriptionRef, now: now });
    return new Response(JSON.stringify({ handled: out.handled, action: out.action, duplicate: !first }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('roundsy-stripe-webhook failed', event && event.type, e && e.message);
    return new Response('failed', { status: 500 }); // Stripe tries again later
  }
});
