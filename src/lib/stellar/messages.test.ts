import { expect, test } from "vitest";
import { transferMessage, withdrawalMessage } from "./messages";

const common = {
  networkPassphrase: "Test SDF Network ; September 2015",
  channelId: "ch-1",
  from: "GFROM",
  to: "GTO",
  amount: "5000000",
  expiresAt: "2026-01-01T00:00:30.900Z",
};

test("a transfer is signed field by field, with the expiry in whole seconds", () => {
  expect(transferMessage({ ...common, nonce: 7 })).toBe(
    "cell:transfer:v1:Test SDF Network ; September 2015:ch-1:GFROM:GTO:5000000:7:1767225630",
  );
});

test("a withdrawal is bound to its request id", () => {
  expect(withdrawalMessage({ ...common, requestId: "req-9" })).toBe(
    "cell:withdraw:v1:Test SDF Network ; September 2015:ch-1:GFROM:GTO:5000000:req-9:1767225630",
  );
});
