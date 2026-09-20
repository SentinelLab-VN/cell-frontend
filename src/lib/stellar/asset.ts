import { Asset } from "@stellar/stellar-sdk";

export interface ResolvedAsset {
  code: string;
  issuer?: string;
  /** The Stellar Asset Contract that represents it on Soroban. */
  tokenContractId: string;
}

/** Accepts `XLM` or `CODE:ISSUER`. Returns null while the text is not an asset yet. */
export function resolveAsset(text: string, networkPassphrase: string): ResolvedAsset | null {
  const input = text.trim();
  try {
    if (input.toUpperCase() === "XLM") {
      return { code: "XLM", tokenContractId: Asset.native().contractId(networkPassphrase) };
    }
    const [code, issuer] = input.split(":");
    if (!code || !issuer) return null;
    return { code, issuer, tokenContractId: new Asset(code, issuer).contractId(networkPassphrase) };
  } catch {
    return null;
  }
}
