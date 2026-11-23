import { describe, expect, it } from "vitest";
import { eraseStoredData, isErasableKey } from "./eraseData";

class FakeStore implements Pick<Storage, "removeItem"> {
  constructor(public data: Record<string, string>) {}
  removeItem(key: string) { delete this.data[key]; }
}
const fake = (data: Record<string, string>) => {
  const s = new FakeStore(data);
  return new Proxy(s, { ownKeys: () => Object.keys(s.data), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) }) as unknown as Storage & { data: Record<string, string> };
};

describe("erase data on this device", () => {
  it("recognises the app's keys and the sign-in session, and nothing else", () => {
    for (const k of ["meddaily:player:v1", "meddaily:reminder", "sb-replaqmcwynrxclunkck-auth-token", "sb-replaqmcwynrxclunkck-auth-token-code-verifier"]) expect(isErasableKey(k)).toBe(true);
    for (const k of ["theme", "other-app:state", "sb-anything-else", "studybible:progress"]) expect(isErasableKey(k)).toBe(false);
  });
  it("removes the saved session too, so the account cannot silently come back after a reload", () => {
    const local = fake({ "meddaily:player:v1": "{}", "sb-abc-auth-token": "{}", "sb-abc-auth-token-code-verifier": "x", keep: "me" });
    const removed = eraseStoredData([local]);
    expect(removed.sort()).toEqual(["meddaily:player:v1", "sb-abc-auth-token", "sb-abc-auth-token-code-verifier"]);
    expect(local.data).toEqual({ keep: "me" });
  });
});
