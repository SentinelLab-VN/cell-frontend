import { hash, Keypair } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";

const PREFIX = "Stellar Signed Message:\n";

/**
 * What a Stellar wallet actually signs when asked to sign text: the SHA-256 of
 * a fixed prefix plus the message, so that no message can double as a transaction.
 */
export function sep53Digest(message: string): Buffer {
  return Buffer.from(hash(Buffer.concat([Buffer.from(PREFIX, "utf8"), Buffer.from(message, "utf8")])));
}

export function signSep53(keypair: Keypair, message: string): string {
  return Buffer.from(keypair.sign(sep53Digest(message))).toString("hex");
}
