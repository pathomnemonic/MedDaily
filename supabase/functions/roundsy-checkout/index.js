// roundsy-checkout — the website's way to buy Roundsy Pro.
//
// The page calls this with the player's sign-in (a Supabase session) and one of:
//   { action: 'prices' }                    -> the plans for sale, with real prices from Stripe
//   { action: 'checkout', product_id }      -> { url } of a Stripe Checkout page to send the player to
//   { action: 'portal' }                    -> { url } of the Stripe page where they cancel or change a subscription
//   { action: 'subscription' }              -> what Stripe says about this member's subscription right now
//   { action: 'sync' }                      -> reconcile the database with what Stripe says the member holds
//
// Deploy:  supabase functions deploy roundsy-checkout --no-verify-jwt
// Secrets (Roundsy specific names, because this Supabase project is shared with the other apps):
//   ROUNDSY_STRIPE_SECRET_KEY, ROUNDSY_SITE_URL (https://pathomnemonic.github.io/MedDaily),
//   ROUNDSY_STRIPE_PRICE_MONTHLY, ROUNDSY_STRIPE_PRICE_YEARLY (Price ids from the same Stripe mode as the key)
// Ported from the Dx Dash pro-checkout function, keeping the actions Roundsy uses.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.3';
import { PRODUCTS, chargeReturned, configuredProducts, describePrice, priceProblem, checkoutParams, portalConfig, productFor, grantsFromSubscriptions, grantArgsForSubscription, periodEnd, invoiceCharge, invoiceChargeId } from '../_shared/roundsy-billing.js';

var STRIPE_KEY = Deno.env.get('ROUNDSY_STRIPE_SECRET_KEY') || '';
var env = {};
Object.keys(PRODUCTS).forEach(function (id) { env[PRODUCTS[id].env] = Deno.env.get(PRODUCTS[id].env) || ''; });
env.SITE_URL = Deno.env.get('ROUNDSY_SITE_URL') || '';
var admin = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '', { auth: { persistSession: false }, db: { schema: 'meddaily' } });

var CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
function json(body, status) { return new Response(JSON.stringify(body), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, CORS) }); }

async function stripe(path, form, method) {
  var res = await fetch('https://api.stripe.com/v1/' + path, {
    method: method || (form ? 'POST' : 'GET'),
    headers: Object.assign({ Authorization: 'Bearer ' + STRIPE_KEY }, form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    body: form ? new URLSearchParams(form).toString() : undefined
  });
  var data = await res.json();
  if (!res.ok) throw new Error((data && data.error && data.error.message) || 'Stripe said ' + res.status);
  return data;
}

var _prices = { at: 0, list: [] };
async function prices() {
  if (Date.now() - _prices.at < 5 * 60 * 1000) return _prices.list;
  var list = [];
  for (var id of configuredProducts(env)) {
    try {
      var price = await stripe('prices/' + encodeURIComponent(env[PRODUCTS[id].env]));
      // a Price that does not match its plan (a yearly price that renews monthly) is never offered
      var wrong = priceProblem(id, price);
      if (wrong) { console.error('price for ' + id + ' is not sold: ' + wrong); continue; }
      list.push(describePrice(id, price));
    } catch (e) { console.error('price for ' + id + ' failed', e && e.message); } // (one bad Price id must not hide the others)
  }
  if (!list.length) throw new Error('No plan could be loaded. Check the ROUNDSY_STRIPE_PRICE_* secrets are Price ids (price_...) from the same Stripe mode as the secret key.');
  _prices = { at: Date.now(), list: list };
  return list;
}

Deno.serve(async function (req) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  var body = {};
  try { body = await req.json(); } catch { body = {}; }
  try {
    if (body.action === 'prices') {
      if (!STRIPE_KEY) return json({ error: 'Web payments are not set up yet.' }, 503);
      return json({ plans: await prices() });
    }

    // everything else needs a signed-in player
    var jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    var who = jwt ? await admin.auth.getUser(jwt) : null;
    var user = who && who.data && who.data.user;
    if (!user) return json({ error: 'Sign in first.' }, 401);
    if (user.is_anonymous || !user.email) return json({ error: 'Create an account first, so Pro stays with you.' }, 403);

    var customer = await admin.rpc('user_stripe_customer', { p_user: user.id });
    var customerId = customer && customer.data ? customer.data : '';

    if (!STRIPE_KEY) return json({ error: 'Web payments are not set up yet.' }, 503);

    if (body.action === 'portal') {
      if (!customerId) return json({ error: 'No web subscription found for this account.' }, 404);
      var ret = { customer: customerId, return_url: env.SITE_URL + '/?pro=billing' };
      var cancelFlow = null;
      if (body.cancel) {
        try {
          var subs = await stripe('subscriptions?customer=' + encodeURIComponent(customerId) + '&status=active&limit=1');
          var sub = subs && subs.data && subs.data[0];
          if (sub) cancelFlow = { 'flow_data[type]': 'subscription_cancel', 'flow_data[subscription_cancel][subscription]': sub.id };
        } catch { cancelFlow = null; }
      }
      var portal;
      var attempt = function (extra) { return stripe('billing_portal/sessions', Object.assign({}, ret, extra || {})); };
      try {
        try { portal = await attempt(cancelFlow); } catch (e1) { if (!cancelFlow) throw e1; portal = await attempt(); }
      } catch (e) {
        // no portal settings saved in the Stripe Dashboard yet: create ours (cancel at period end, update card, invoices), then retry
        if (!/configuration/i.test((e && e.message) || '')) throw e;
        var cfg = await stripe('billing_portal/configurations', portalConfig(env));
        try { portal = await attempt(Object.assign({ configuration: cfg.id }, cancelFlow || {})); } catch { portal = await attempt({ configuration: cfg.id }); }
      }
      return json({ url: portal.url });
    }

    // What Stripe says about this member's subscription right now: is it renewing, or set to end? (The app never
    // assumes that tapping Cancel meant cancelling: it asks, and tells the member what is actually true.)
    if (body.action === 'subscription') {
      if (!customerId) return json({ ok: true, status: 'none' });
      var found;
      try { found = await stripe('subscriptions?customer=' + encodeURIComponent(customerId) + '&status=all&limit=10'); } catch (e) { console.error('roundsy-checkout subscription failed', e && e.message); return json({ ok: false, error: 'Could not check with Stripe just now.' }, 502); }
      var liveSub = ((found && found.data) || []).filter(function (x) { return ['active', 'trialing', 'past_due'].indexOf(x.status) >= 0; })[0];
      if (!liveSub) return json({ ok: true, status: 'none' });
      var endSec = periodEnd(liveSub);
      var cancelling = !!liveSub.cancel_at_period_end || !!liveSub.cancel_at;
      return json({ ok: true, status: liveSub.status, cancel_at_period_end: cancelling, ends: endSec ? new Date(endSec * 1000).toISOString() : '', plan: (liveSub.metadata && liveSub.metadata.plan) || '' });
    }

    // Put right a member whose payment event never reached us: ask Stripe what this customer holds and grant it.
    // (Safe to repeat: the grant for the stripe source is replaced with what Stripe currently reports.)
    if (body.action === 'sync') {
      if (!customerId) return json({ ok: true, granted: [] });
      var granted = [];
      try {
        var all = await stripe('subscriptions?customer=' + encodeURIComponent(customerId) + '&status=all&limit=10');
        var now = Math.floor(Date.now() / 1000);
        // A subscription whose current period was refunded is not granted again here: it can still read as live
        // in Stripe, and the refund already took the plan back. A refund state that cannot be read counts as not
        // refunded, so a paying member is not left without Pro by a failed check.
        var liveSubs = [];
        for (var s of ((all && all.data) || [])) {
          var refunded = false;
          var invId = s && s.latest_invoice ? (typeof s.latest_invoice === 'string' ? s.latest_invoice : s.latest_invoice.id) : '';
          if (invId) {
            try {
              var inv = await stripe('invoices/' + encodeURIComponent(invId));
              var ch = invoiceCharge(inv);
              if (!ch) { var cid = invoiceChargeId(inv); if (cid) ch = await stripe('charges/' + encodeURIComponent(cid) + '?expand[]=dispute'); }
              refunded = !!(ch && chargeReturned(ch));
            } catch { refunded = false; }
          }
          if (!refunded) liveSubs.push(s);
        }
        var grants = grantsFromSubscriptions(liveSubs, now);
        for (var g of grants) {
          var ga = grantArgsForSubscription(user.id, g.plan, g.until, g.trial);
          var r = await admin.rpc(ga.rpc, ga.args);
          if (r.error) throw new Error(r.error.message);
          granted.push(g.plan);
        }
      } catch (e) {
        console.error('roundsy-checkout sync failed', e && e.message);
        return json({ ok: false, error: 'Could not check with Stripe just now.' }, 502);
      }
      return json({ ok: true, granted: granted });
    }

    if (body.action === 'checkout') {
      var wanted = productFor(body.product_id || body.plan);
      if (!wanted) return json({ error: 'Unknown plan.' }, 400);
      // only a plan whose Stripe Price is set up the way the plan needs is ever sold
      // (a plan with no Price id set at all is left to answer "not for sale yet" below)
      var sellable = env[wanted.def.env] ? await prices() : [];
      if (env[wanted.def.env] && !sellable.some(function (x) { return x.id === wanted.id; })) return json({ error: 'That plan is not set up correctly yet. You have not been charged.' }, 503);
      // a customer saved while Stripe was in test mode does not exist in live mode: start fresh rather than fail to sell
      var staleCustomer = function (e) { return /no such customer/i.test((e && e.message) || ''); };
      if (customerId) {
        try {
          var live = await stripe('subscriptions?customer=' + encodeURIComponent(customerId) + '&status=all&limit=10');
          var running = ((live && live.data) || []).filter(function (x) { return ['active', 'trialing', 'past_due'].indexOf(x.status) >= 0; });
          if (running.length) return json({ error: 'You already have an active subscription. Use Manage subscription instead.' }, 409);
        } catch (e) { if (staleCustomer(e)) customerId = ''; else throw e; }
      }
      var build = function (cust) {
        var params = checkoutParams(wanted.id, user.id, env, { customer: cust || undefined });
        if (!params.customer) params.customer_email = user.email || undefined;
        Object.keys(params).forEach(function (k) { if (params[k] === undefined) delete params[k]; });
        return params;
      };
      var session;
      try { session = await stripe('checkout/sessions', build(customerId)); } catch (e) {
        if (customerId && staleCustomer(e)) session = await stripe('checkout/sessions', build('')); else throw e;
      }
      return json({ url: session.url });
    }
    return json({ error: 'Unknown request.' }, 400);
  } catch (e) {
    console.error('roundsy-checkout failed', e && e.message);
    return json({ error: (e && e.message) || 'Something went wrong.' }, 400);
  }
});
