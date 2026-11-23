/** Storage keys that belong to this app on this device: its own data plus the sign-in session and its pending sign-in step. */
export const isErasableKey = (key: string): boolean => key.startsWith("meddaily") || /^sb-.+-auth-token(-code-verifier)?$/.test(key);

/** Removes everything the app stored. Returns the keys that were removed (for tests and diagnostics). */
export function eraseStoredData(stores: readonly Storage[]): string[] {
  const removed: string[] = [];
  for (const store of stores) {
    try {
      for (const key of Object.keys(store).filter(isErasableKey)) { store.removeItem(key); removed.push(key); }
    } catch { /* storage unavailable */ }
  }
  return removed;
}
