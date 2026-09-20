import { isConnected, requestAccess, signMessage, signTransaction } from "@stellar/freighter-api";
import { Buffer } from "buffer";
import { WalletError, type Wallet, type WalletProvider } from "./types";

export const freighter: WalletProvider = {
  id: "freighter",
  name: "Freighter",
  hint: "Browser extension",

  async connect(): Promise<Wallet> {
    const { isConnected: installed } = await isConnected();
    if (!installed) throw new WalletError("Freighter is not installed in this browser.");

    const access = await requestAccess();
    if (access.error || !access.address) throw new WalletError(access.error?.message ?? "Freighter refused access.");
    const address = access.address;

    return {
      providerId: "freighter",
      address,

      async signMessage(message) {
        const signed = await signMessage(message, { address });
        if (signed.error || !signed.signedMessage) {
          throw new WalletError(signed.error?.message ?? "The message was not signed.");
        }
        // Base64 from current Freighter; older builds hand back the raw bytes.
        const bytes =
          typeof signed.signedMessage === "string"
            ? Buffer.from(signed.signedMessage, "base64")
            : Buffer.from(signed.signedMessage);
        return bytes.toString("hex");
      },

      async signTransaction(xdr, networkPassphrase) {
        const signed = await signTransaction(xdr, { address, networkPassphrase });
        if (signed.error || !signed.signedTxXdr) {
          throw new WalletError(signed.error?.message ?? "The transaction was not signed.");
        }
        return signed.signedTxXdr;
      },
    };
  },
};
