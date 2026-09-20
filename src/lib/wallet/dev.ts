import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { signSep53 } from "./sep53";
import { WalletError, type Wallet } from "./types";

export const DEV_WALLET_ENABLED = import.meta.env.VITE_ENABLE_DEV_WALLET === "true";

/**
 * A wallet made from a secret seed, for development and the end-to-end tests.
 * It signs exactly as an extension would, so the rest of the app cannot tell.
 */
export function devWallet(secret: string): Wallet {
  let keypair: Keypair;
  try {
    keypair = Keypair.fromSecret(secret.trim());
  } catch {
    throw new WalletError("That is not a Stellar secret seed (S…).");
  }

  return {
    providerId: "dev",
    address: keypair.publicKey(),
    signMessage: async (message) => signSep53(keypair, message),
    signTransaction: async (xdr, networkPassphrase) => {
      const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase);
      tx.sign(keypair);
      return tx.toXDR();
    },
  };
}
