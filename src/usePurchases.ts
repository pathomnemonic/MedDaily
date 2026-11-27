import { useCallback, useEffect, useRef, useState } from "react";
import type { AccountController } from "./useAccount";
import { isNative, nativePlatform } from "./native";
import { PRO_PRODUCTS, buyProduct, manageStoreSubscriptions, ownedProduct, productReceipt, restoreStorePurchases, startStore, storePrice, type PlanPrice } from "./purchases";

/**
 * Purchase actions for the paywall and the Settings Pro card. Native buys
 * go through the store and are verified with the server before the Pro
 * state is reread; web buys go through Stripe Checkout. Verification runs
 * on sign in as well: the polling pattern the other apps use in place of
 * store notification handlers, so renewals, refunds and cancellations
 * land the next time a signed in player opens the app.
 */
export function usePurchases(account: AccountController) {
  const native = isNative();
  const [prices, setPrices] = useState<PlanPrice[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const verifiedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!native) return;
    let live = true;
    void (async () => {
      if (!(await startStore())) return;
      const found = (await Promise.all(PRO_PRODUCTS.map((p) => storePrice(p.id)))).filter((x): x is PlanPrice => x !== null);
      if (live) setPrices(found);
    })();
    return () => { live = false; };
  }, [native]);

  /** Verifies every owned store product with the server, then rereads Pro. Returns the fresh Pro answer. */
  const verifyOwned = useCallback(async (): Promise<boolean | null> => {
    if (!native || !account.user) return null;
    const platform = nativePlatform();
    if (platform !== "ios" && platform !== "android") return null;
    for (const p of PRO_PRODUCTS) {
      try {
        if (!(await ownedProduct(p.id))) continue;
        const token = await productReceipt(p.id);
        if (token) await account.verifyPurchase(platform, p.id, token);
      } catch { /* verification retries on a later open; it never takes anything away by itself */ }
    }
    return account.refreshPro();
  }, [account, native]);

  useEffect(() => {
    const uid = account.user?.id ?? null;
    if (!uid || verifiedFor.current === uid) return;
    verifiedFor.current = uid;
    void verifyOwned();
  }, [account.user, verifyOwned]);

  const buy = useCallback(async (id: string) => {
    setNote("");
    if (!account.user) { setNote("Pro needs a free account first. Sign in from Options, then come back here."); return; }
    setBusy(id);
    try {
      if (native) {
        const out = await buyProduct(id);
        if (out.cancelled) setNote("Purchase cancelled. Nothing was charged.");
        else if (!out.ok) setNote("That purchase could not be started. Check your store account and try again.");
        else {
          const has = await verifyOwned();
          setNote(has ? "Purchase complete. Pro is on for this account." : "Purchase complete. Pro will switch on as soon as the store confirms it.");
        }
      } else {
        window.location.href = await account.checkoutUrl(id);
      }
    } catch (e) { setNote(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(null); }
  }, [account, native, verifyOwned]);

  const restore = useCallback(async () => {
    setNote("");
    setBusy("restore");
    try {
      await restoreStorePurchases();
      const has = await verifyOwned();
      setNote(has ? "Your purchase was restored. Pro is on." : "No earlier purchase was found for this store account.");
    } catch { setNote("Restore did not finish. Try again in a moment."); }
    finally { setBusy(null); }
  }, [verifyOwned]);

  const manage = useCallback(async () => {
    setNote("");
    setBusy("manage");
    try {
      if (native) await manageStoreSubscriptions();
      else window.location.href = await account.portalUrl();
    } catch (e) { setNote(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setBusy(null); }
  }, [account, native]);

  return { native, prices, busy, note, buy, restore, manage, verifyOwned };
}

export type PurchasesController = ReturnType<typeof usePurchases>;
