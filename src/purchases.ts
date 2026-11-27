import { isNative, nativePlatform } from "./native";

/**
 * The store connection for Roundsy Pro, adapted from the Dx Dash purchase
 * layer: one shared CdvPurchase store object, every product registered
 * together before the store starts, approved transactions finished at
 * once, and prices always read from the store rather than hardcoded.
 * On web there is no store; this module resolves to unavailable and the
 * web checkout path in usePurchases takes over.
 */

/** Store product ids, matching App Store Connect and Play Console exactly. */
export const PRO_PRODUCTS = [
  { id: "roundsy_pro_monthly", plan: "pro_monthly", label: "Monthly", period: "P1M", listPrice: "$0.99", listMicros: 990_000, blurb: "" },
  { id: "roundsy_pro_yearly", plan: "pro_yearly", label: "Yearly", period: "P1Y", listPrice: "$9.99", listMicros: 9_990_000, blurb: "BEST VALUE" }
] as const;
export type ProProductId = (typeof PRO_PRODUCTS)[number]["id"];

export interface PlanPrice { id: string; priceText: string; priceMicros: number; currency: string; period: string; trialDays: number }
export interface BuyOutcome { ok: boolean; cancelled?: boolean; error?: string }

/** Days in an ISO 8601 period such as P7D, P1W, P1M or P1Y. A month counts as 30 days, a year as 365. */
export function isoDays(period: string): number {
  const m = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?$/.exec(period ?? "");
  if (!m) return 0;
  return Number(m[1] ?? 0) * 365 + Number(m[2] ?? 0) * 30 + Number(m[3] ?? 0) * 7 + Number(m[4] ?? 0);
}

interface PricingPhase { price?: string; priceMicros?: number; currency?: string; billingPeriod?: string; paymentMode?: string }
interface OfferLike { pricingPhases?: PricingPhase[] }
interface ProductLike { owned?: boolean; offers?: OfferLike[]; getOffer?: () => OfferLike | undefined }
interface TransactionLike { products?: { id?: string }[]; transactionId?: string; nativePurchase?: { purchaseToken?: string }; finish?: () => unknown }
interface StoreLike {
  register: (products: { id: string; type: unknown; platform: unknown }[]) => void;
  when: () => {
    approved: (cb: (t: TransactionLike) => void) => unknown;
    finished: (cb: (t: TransactionLike) => void) => unknown;
  };
  initialize: (platforms: unknown[]) => Promise<unknown[]>;
  get: (id: string) => ProductLike | undefined;
  order: (offer: OfferLike) => Promise<{ code?: number | string; message?: string } | undefined>;
  restorePurchases: () => Promise<unknown>;
  manageSubscriptions: () => Promise<unknown>;
  findInLocalReceipts?: (product: ProductLike) => { nativePurchase?: { purchaseToken?: string }; transactionId?: string } | undefined | Promise<{ nativePurchase?: { purchaseToken?: string }; transactionId?: string } | undefined>;
}
interface PluginLike {
  store: StoreLike;
  ProductType: { PAID_SUBSCRIPTION: unknown };
  Platform: { APPLE_APPSTORE: unknown; GOOGLE_PLAY: unknown };
  ErrorCode: { PAYMENT_CANCELLED: number | string };
}

/** The display data for one offer: the paid phase price, plus any free trial phase length. Pure, so it is unit tested. */
export function offerData(offer: OfferLike): { priceText: string; priceMicros: number; currency: string; period: string; trialDays: number } {
  const phases = offer.pricingPhases ?? [];
  const paid = phases.find((p) => p.paymentMode !== "FREE_TRIAL") ?? phases[0];
  const trial = phases.find((p) => p.paymentMode === "FREE_TRIAL");
  return {
    priceText: paid?.price ?? "",
    priceMicros: paid?.priceMicros ?? 0,
    currency: paid?.currency ?? "",
    period: paid?.billingPeriod ?? "",
    trialDays: trial ? isoDays(trial.billingPeriod ?? "") : 0
  };
}

/** The offer to show: one carrying a free trial when the product has one, else the first. */
export function bestOffer(offers: readonly OfferLike[]): OfferLike | undefined {
  return offers.find((o) => offerData(o).trialDays > 0) ?? offers[0];
}

let pluginPromise: Promise<PluginLike | null> | null = null;
let startPromise: Promise<boolean> | null = null;
const pendingOrders = new Map<string, (out: BuyOutcome) => void>();
const finishedListeners = new Set<(ids: string[]) => void>();
const tokenByProduct = new Map<string, string>();

function loadPlugin(): Promise<PluginLike | null> {
  if (!isNative()) return Promise.resolve(null);
  if (!pluginPromise) {
    pluginPromise = import("capacitor-plugin-cdv-purchase")
      .then((m) => (m as unknown as { CdvPurchase: PluginLike }).CdvPurchase)
      .catch(() => null);
  }
  return pluginPromise;
}

/** Connects the store once. Resolves true when the store answered with at least one product or no errors. */
export function startStore(): Promise<boolean> {
  if (startPromise) return startPromise;
  startPromise = (async () => {
    const plugin = await loadPlugin();
    if (!plugin) return false;
    const name = nativePlatform();
    const platform = name === "ios" ? plugin.Platform.APPLE_APPSTORE : name === "android" ? plugin.Platform.GOOGLE_PLAY : null;
    if (!platform) return false;
    const { store } = plugin;
    store.register(PRO_PRODUCTS.map((p) => ({ id: p.id, type: plugin.ProductType.PAID_SUBSCRIPTION, platform })));
    store.when().approved((t) => { void t.finish?.(); });
    store.when().finished((t) => {
      const ids = (t.products ?? []).map((p) => p.id).filter((id): id is string => typeof id === "string" && id.length > 0);
      for (const id of ids) {
        const token = t.nativePurchase?.purchaseToken ?? t.transactionId;
        if (token) tokenByProduct.set(id, token);
        pendingOrders.get(id)?.({ ok: true });
        pendingOrders.delete(id);
      }
      for (const fn of finishedListeners) fn(ids);
    });
    const errors = await store.initialize([platform]).catch(() => [new Error("initialize failed")]);
    return !errors || errors.length === 0 || PRO_PRODUCTS.some((p) => Boolean(store.get(p.id)));
  })();
  return startPromise;
}

/** The store price for one plan, or null when the store does not have it. */
export async function storePrice(id: string): Promise<PlanPrice | null> {
  if (!(await startStore())) return null;
  const plugin = await loadPlugin();
  if (!plugin) return null;
  const product = plugin.store.get(id);
  if (!product) return null;
  const offers = product.offers?.length ? product.offers : [product.getOffer?.()].filter((o): o is OfferLike => Boolean(o));
  const best = bestOffer(offers);
  if (!best) return null;
  const data = offerData(best);
  return data.priceText ? { id, ...data } : null;
}

/** Opens the store payment sheet for one plan. Resolves through the finished handler, like Dx. */
export async function buyProduct(id: string): Promise<BuyOutcome> {
  if (!(await startStore())) return { ok: false, error: "unavailable" };
  const plugin = await loadPlugin();
  if (!plugin) return { ok: false, error: "unavailable" };
  const { store } = plugin;
  const product = store.get(id);
  const offer = product?.getOffer?.() ?? product?.offers?.[0];
  if (!product || !offer) return { ok: false, error: "unavailable" };
  if (pendingOrders.has(id)) return { ok: false, error: "busy" };
  const done = new Promise<BuyOutcome>((resolve) => pendingOrders.set(id, resolve));
  const err = await store.order(offer).catch((e: unknown) => ({ code: undefined, message: e instanceof Error ? e.message : String(e) }));
  if (err) {
    pendingOrders.delete(id);
    return { ok: false, cancelled: String(err.code) === String(plugin.ErrorCode.PAYMENT_CANCELLED), error: err.message ?? "order_failed" };
  }
  return done;
}

/** Whether the store says this device owns the plan right now. */
export async function ownedProduct(id: string): Promise<boolean> {
  if (!(await startStore())) return false;
  const plugin = await loadPlugin();
  if (!plugin) return false;
  return plugin.store.get(id)?.owned === true;
}

/**
 * The proof token for server verification: the Google purchase token on
 * Android, the transaction id on iOS. Prefers the store local receipts,
 * falls back to the token captured from the finished handler.
 */
export async function productReceipt(id: string): Promise<string | null> {
  const plugin = await loadPlugin();
  if (plugin) {
    try {
      const product = plugin.store.get(id);
      if (product && typeof plugin.store.findInLocalReceipts === "function") {
        const receipt = await plugin.store.findInLocalReceipts(product);
        const token = receipt?.nativePurchase?.purchaseToken ?? receipt?.transactionId;
        if (typeof token === "string" && token.length >= 6) return token;
      }
    } catch { /* fall through to the captured token */ }
  }
  const captured = tokenByProduct.get(id);
  return captured && captured.length >= 6 ? captured : null;
}

export async function restoreStorePurchases(): Promise<void> {
  if (!(await startStore())) return;
  const plugin = await loadPlugin();
  await plugin?.store.restorePurchases().catch(() => undefined);
}

export async function manageStoreSubscriptions(): Promise<void> {
  if (!(await startStore())) return;
  const plugin = await loadPlugin();
  await plugin?.store.manageSubscriptions().catch(() => undefined);
}

/** Notified whenever a transaction finishes, with the finished product ids. */
export function onPurchaseFinished(fn: (ids: string[]) => void): () => void {
  finishedListeners.add(fn);
  return () => { finishedListeners.delete(fn); };
}
