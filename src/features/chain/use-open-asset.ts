import { useState } from "react";
import { useChannels, useConfig } from "@/features/tenant/queries";
import { parseAmount } from "@/lib/amount";
import { channelsApi } from "@/lib/api/channels";
import { resolveAsset } from "@/lib/stellar/asset";
import { useSubmitTx } from "./use-submit-tx";

const STELLAR_DECIMALS = 7;

/** The "open an asset" form: its two inputs, what they resolve to, and the transaction. */
export function useOpenAsset(tenantId: string, initialAsset = "") {
  const { data: config } = useConfig();
  const channels = useChannels(tenantId);
  const [assetText, setAssetText] = useState(initialAsset);
  const [capText, setCapText] = useState("");

  const asset = config ? resolveAsset(assetText, config.networkPassphrase) : null;
  const cap = capText.trim() === "" ? "0" : parseAmount(capText, STELLAR_DECIMALS);

  const open = useSubmitTx(async () => {
    if (!asset || cap === null) throw new Error("Enter an asset and a valid cap.");
    // Opened in an earlier visit but never signed: ask for the same envelope again.
    const existing = channels.data?.find((c) => c.tokenContractId === asset.tokenContractId);
    if (existing) return channelsApi.prepareSetCap(tenantId, existing.id, cap);

    const opened = await channelsApi.open(tenantId, {
      assetCode: asset.code,
      assetIssuer: asset.issuer,
      tokenContractId: asset.tokenContractId,
      releaseCap: cap,
    });
    return opened.tx;
  });

  return { assetText, setAssetText, capText, setCapText, asset, valid: !!asset && cap !== null, open };
}
