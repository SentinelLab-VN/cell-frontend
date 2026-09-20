import { useMutation } from "@tanstack/react-query";
import { walletStore } from "@/features/session/wallet-store";
import { tenantsApi } from "@/lib/api/tenants";
import type { PreparedTx } from "@/lib/api/types";
import { submitSigned } from "@/lib/stellar/network";

/**
 * The shape of every admin action: the API builds an envelope, the wallet signs
 * it, and the app submits it to the network. `prepare` is the only part that
 * differs from one action to the next.
 */
export function useSubmitTx<Input = void>(prepare: (input: Input) => Promise<PreparedTx | string>) {
  return useMutation({
    mutationFn: async (input: Input) => {
      const [prepared, config, wallet] = await Promise.all([prepare(input), tenantsApi.config(), walletStore.require()]);
      const xdr = typeof prepared === "string" ? prepared : prepared.xdr;
      const signed = await wallet.signTransaction(xdr, config.networkPassphrase);
      return submitSigned(signed, config.networkPassphrase);
    },
  });
}
