import { useState } from "react";
import { useChannels, useConfig } from "@/features/tenant/queries";
import { parseAmount } from "@/lib/amount";
import { channelsApi } from "@/lib/api/channels";
import { assetText, DEFAULT_ASSETS, knownIssuer, resolveAsset } from "@/lib/stellar/asset";
import { useSubmitTx } from "./use-submit-tx";

const STELLAR_DECIMALS = 7;

/**
 * The "open an asset" form. The code comes from the deployment's list
 * (`/api/config`), never typed; an issued asset also takes its issuer, prefilled
 * when the network has a well-known one.
 */
export function useOpenAsset(tenantId: string, initialCode = "XLM") {
  const { data: config } = useConfig();
  const channels = useChannels(tenantId);
  const assets = config?.supportedAssets?.length ? config.supportedAssets : DEFAULT_ASSETS;
  const [code, setCodeState] = useState(initialCode);
  // `null` means "not typed": the issuer is then the network's well-known one
  // for the picked code, if any. Picking another code drops what was typed.
  const [typedIssuer, setTypedIssuer] = useState<string | null>(null);
  const [capText, setCapText] = useState("");
  const issuer = typedIssuer ?? (config ? (knownIssuer(config.network, code) ?? "") : "");
  const setCode = (next: string) => {
    setCodeState(next);
    setTypedIssuer(null);
  };

  const supported = assets.includes(code);
  const asset = config && supported ? resolveAsset(assetText(code, issuer), config.networkPassphrase) : null;
  const cap = capText.trim() === "" ? "0" : parseAmount(capText, STELLAR_DECIMALS);

  const open = useSubmitTx(async () => {
    if (!asset || cap === null) throw new Error("Pick an asset and enter a valid cap.");
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

  return {
    assets,
    code,
    setCode,
    issuer,
    setIssuer: setTypedIssuer,
    needsIssuer: code !== "XLM",
    capText,
    setCapText,
    asset,
    valid: !!asset && cap !== null,
    open,
  };
}
