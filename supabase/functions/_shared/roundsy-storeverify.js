/* global btoa, atob, TextDecoder */
/**
 * roundsy-storeverify.js — checking a phone store purchase with Google Play / the App Store themselves, with no
 * network in it so it can be tested. Ported from the Dx Dash storeverify module; the differences are the Roundsy
 * products and the meddaily grant functions. The edge function roundsy-iap-verify does the fetching and the granting.
 *
 * Why: a purchase made in the phone app is otherwise known only to the phone. Checked here, it becomes part of the
 * account (so it shows on the website and on a new phone), a refund is noticed, and one purchase cannot be handed to
 * several accounts.
 */
import { PRODUCTS, GRACE_SECONDS } from './roundsy-billing.js';

function b64url(bytes) {
  var s = '';
  var arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (var i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(str) {
  var b = String(str).replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  var bin = atob(b);
  var out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function pemToDer(pem) {
  var body = String(pem || '').replace(/-----BEGIN [A-Z ]+-----/g, '').replace(/-----END [A-Z ]+-----/g, '').replace(/\\n/g, '').replace(/\s+/g, '');
  return fromB64url(body.replace(/\+/g, '-').replace(/\//g, '_'));
}

async function signJwt(header, claims, pem, algo) {
  var enc = new TextEncoder();
  var input = b64url(enc.encode(JSON.stringify(header))) + '.' + b64url(enc.encode(JSON.stringify(claims)));
  var key = await crypto.subtle.importKey('pkcs8', pemToDer(pem), algo.import, false, ['sign']);
  var sig = await crypto.subtle.sign(algo.sign, key, enc.encode(input));
  return input + '.' + b64url(sig);
}

/** A product id from the app, understood: { kind: 'subscription', plan }, or null. Roundsy sells two subscriptions and nothing else. */
export function describeStoreProduct(productId) {
  var id = String(productId || '');
  if (PRODUCTS[id]) return { kind: 'subscription', plan: PRODUCTS[id].plan };
  return null;
}

/** A short stable key for a purchase token (the token itself is long and private, so only a hash is kept). */
export async function tokenKey(token) {
  var d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(token)));
  return Array.prototype.map.call(new Uint8Array(d), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
}

export function googleConfigured(env) { return !!(env && env.GOOGLE_SA_EMAIL && env.GOOGLE_SA_PRIVATE_KEY && env.GOOGLE_PLAY_PACKAGE); }
export function appleStoreConfigured(env) { return !!(env && env.APPLE_IAP_ISSUER_ID && env.APPLE_IAP_KEY_ID && env.APPLE_IAP_PRIVATE_KEY && env.APPLE_BUNDLE_ID); }

/** The signed request Google's token service turns into an access token for the Play Developer API. */
export function googleAssertion(env, nowSec) {
  return signJwt({ alg: 'RS256', typ: 'JWT' }, {
    iss: env.GOOGLE_SA_EMAIL, scope: 'https://www.googleapis.com/auth/androidpublisher', aud: 'https://oauth2.googleapis.com/token', iat: nowSec, exp: nowSec + 3000
  }, env.GOOGLE_SA_PRIVATE_KEY, { import: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, sign: { name: 'RSASSA-PKCS1-v1_5' } });
}

/** Where to ask Google about a purchase. */
export function googleUrl(kind, pkg, productId, token) {
  var base = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' + encodeURIComponent(pkg) + '/purchases/';
  return kind === 'subscription'
    ? base + 'subscriptionsv2/tokens/' + encodeURIComponent(token)
    : base + 'products/' + encodeURIComponent(productId) + '/tokens/' + encodeURIComponent(token);
}

/**
 * What a purchase check means, in one shape: { valid, revoked, expiresAt (unix s, 0 for none), pending }.
 *   valid   - the buyer has it now
 *   revoked - it was refunded or cancelled with the money returned
 */
export function parseGoogleSubscription(json, nowSec) {
  var state = String((json && json.subscriptionState) || '');
  var items = (json && json.lineItems) || [];
  var end = 0;
  var productIds = [];
  items.forEach(function (li) {
    var t = Date.parse(li && li.expiryTime); if (t > 0) end = Math.max(end, Math.floor(t / 1000));
    if (li && li.productId && productIds.indexOf(String(li.productId)) < 0) productIds.push(String(li.productId));
  });
  var live = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD', 'SUBSCRIPTION_STATE_CANCELED'].indexOf(state) >= 0 && end > nowSec;
  // Google marks a subscription EXPIRED when it ends; one that is EXPIRED while paid time is still on the clock was
  // cut short, which is what a revocation (or an immediate refund) looks like. A natural expiry has no paid time
  // left and is not a revocation: the grant simply lapses.
  var revoked = state === 'SUBSCRIPTION_STATE_EXPIRED' && end > nowSec;
  return { valid: live, revoked: revoked, expiresAt: end, pending: state === 'SUBSCRIPTION_STATE_PENDING', productIds: productIds };
}

export function parseGoogleProduct(json) {
  var st = json && json.purchaseState;
  return { valid: st === 0, revoked: st === 1, expiresAt: 0, pending: st === 2 };
}

/** The signed request the App Store Server API asks for (valid for five minutes). */
export function appleStoreJwt(env, nowSec) {
  return signJwt({ alg: 'ES256', kid: env.APPLE_IAP_KEY_ID, typ: 'JWT' }, {
    iss: env.APPLE_IAP_ISSUER_ID, iat: nowSec, exp: nowSec + 300, aud: 'appstoreconnect-v1', bid: env.APPLE_BUNDLE_ID
  }, env.APPLE_IAP_PRIVATE_KEY, { import: { name: 'ECDSA', namedCurve: 'P-256' }, sign: { name: 'ECDSA', hash: 'SHA-256' } });
}

/** The two places to ask Apple (production first; a sandbox purchase is only known to the sandbox). */
export function appleTransactionUrls(transactionId) {
  var id = encodeURIComponent(transactionId);
  return ['https://api.storekit.itunes.apple.com/inApps/v1/transactions/' + id, 'https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/' + id];
}

/** The body of a signed token from Apple (it came from Apple's own server over TLS with our key, so it is read, not re-verified). */
export function decodeJwsPayload(jws) {
  var parts = String(jws || '').split('.');
  if (parts.length !== 3) return null;
  try { return JSON.parse(new TextDecoder().decode(fromB64url(parts[1]))); } catch { return null; }
}

export function parseAppleTransaction(payload, expectedBundle, nowSec) {
  if (!payload || (expectedBundle && payload.bundleId !== expectedBundle)) return null;
  var expires = payload.expiresDate ? Math.floor(Number(payload.expiresDate) / 1000) : 0;
  var revoked = !!payload.revocationDate;
  var recurring = String(payload.type || '').indexOf('Subscription') >= 0 && String(payload.type || '').indexOf('Non-Renewing') < 0;
  var valid = !revoked && (recurring ? expires > nowSec : true);
  return { valid: valid, revoked: revoked, expiresAt: recurring ? expires : 0, pending: false, productId: payload.productId || '', key: String(payload.originalTransactionId || payload.transactionId || '') };
}

/**
 * Decide what the database should do for a checked purchase.
 * @param {{kind: string, plan?: string}} product from describeStoreProduct
 * @param {{valid: boolean, revoked: boolean, expiresAt: number}} check
 * @param {string} source the meddaily source for this store: 'apple' or 'google'
 * @returns {{rpc: string, args: object}|null} the call to make, or null when there is nothing to change
 */
export function grantFor(product, check, user, source) {
  if (!product || !check) return null;
  if (check.revoked) return { rpc: 'revoke_pro_source', args: { p_user: user, p_source: source } };
  if (!check.valid) return null;
  var until = check.expiresAt ? new Date((check.expiresAt + GRACE_SECONDS) * 1000).toISOString() : null;
  return { rpc: 'grant_pro', args: { p_user: user, p_plan: product.plan, p_source: source, p_status: 'active', p_period_end: until, p_trial_ends: null } };
}
