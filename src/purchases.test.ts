import { describe, expect, it } from "vitest";
import { PRO_PRODUCTS, bestOffer, isoDays, offerData } from "./purchases";

describe("store product setup", () => {
  it("registers exactly the products that exist in the stores", () => {
    expect(PRO_PRODUCTS.map((p) => p.id)).toEqual(["roundsy_pro_monthly", "roundsy_pro_yearly"]);
    expect(PRO_PRODUCTS.map((p) => p.plan)).toEqual(["pro_monthly", "pro_yearly"]);
  });
  it("turns ISO periods into days", () => {
    expect(isoDays("P7D")).toBe(7);
    expect(isoDays("P1W")).toBe(7);
    expect(isoDays("P1M")).toBe(30);
    expect(isoDays("P1Y")).toBe(365);
    expect(isoDays("P3M")).toBe(90);
    expect(isoDays("")).toBe(0);
    expect(isoDays("nonsense")).toBe(0);
  });
  it("reads the paid phase and the trial phase out of an offer", () => {
    const data = offerData({ pricingPhases: [
      { paymentMode: "FREE_TRIAL", billingPeriod: "P7D", price: "Free", priceMicros: 0, currency: "USD" },
      { paymentMode: "PAY_AS_YOU_GO", billingPeriod: "P1Y", price: "$9.99", priceMicros: 9_990_000, currency: "USD" }
    ] });
    expect(data).toEqual({ priceText: "$9.99", priceMicros: 9_990_000, currency: "USD", period: "P1Y", trialDays: 7 });
  });
  it("prefers the offer that carries a trial", () => {
    const plain = { pricingPhases: [{ paymentMode: "PAY_AS_YOU_GO", billingPeriod: "P1M", price: "$0.99", priceMicros: 990_000, currency: "USD" }] };
    const trial = { pricingPhases: [{ paymentMode: "FREE_TRIAL", billingPeriod: "P7D" }, { paymentMode: "PAY_AS_YOU_GO", billingPeriod: "P1M", price: "$0.99", priceMicros: 990_000, currency: "USD" }] };
    expect(bestOffer([plain, trial])).toBe(trial);
    expect(bestOffer([plain])).toBe(plain);
    expect(bestOffer([])).toBeUndefined();
  });
});
