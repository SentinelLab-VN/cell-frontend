import { Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import { expect, test } from "vitest";
import { signSep53 } from "./sep53";

// The published SEP-53 vector: the gateway's verifier is tested against the same one.
test("signs text the way a Stellar wallet does", () => {
  const keypair = Keypair.fromSecret("SAKICEVQLYWGSOJS4WW7HZJWAHZVEEBS527LHK5V4MLJALYKICQCJXMW");
  expect(keypair.publicKey()).toBe("GBXFXNDLV4LSWA4VB7YIL5GBD7BVNR22SGBTDKMO2SBZZHDXSKZYCP7L");

  const expected = Buffer.from(
    "fO5dbYhXUhBMhe6kId/cuVq/AfEnHRHEvsP8vXh03M1uLpi5e46yO2Q8rEBzu3feXQewcQE5GArp88u6ePK6BA==",
    "base64",
  ).toString("hex");
  expect(signSep53(keypair, "Hello, World!")).toBe(expected);
});
