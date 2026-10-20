import { describe, expect, it } from "vitest";
import { referralLink } from "./referral";

describe("referralLink", () => {
  it("lands in the tenant and carries the code", () => {
    expect(referralLink("11111111-1111-1111-1111-111111111111", "K7PQ2MWX", "https://app.example")).toBe(
      "https://app.example/t/11111111-1111-1111-1111-111111111111?ref=K7PQ2MWX",
    );
  });

  it("escapes a code that would otherwise break the query string", () => {
    expect(referralLink("t", "a&b", "https://x")).toBe("https://x/t/t?ref=a%26b");
  });
});
