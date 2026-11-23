/**
 * Optional tip jar. Paste the Stripe payment link here (https only); until then the card stays hidden.
 * This is Roundsy's own link. Never use the Ko-fi page, which is reserved for a different app.
 * Tips are voluntary, unlock nothing, and are separate from Pro.
 */
export const TIP_URL = "";

/** The tip card shows only on the web build: the iOS and Android stores restrict links to outside payments inside apps. */
export function tipLink(url: string = TIP_URL, native = false): string | null {
  if (native) return null;
  return /^https:\/\/[^\s]+$/i.test(url.trim()) && !/ko-fi\.com/i.test(url) ? url.trim() : null;
}
