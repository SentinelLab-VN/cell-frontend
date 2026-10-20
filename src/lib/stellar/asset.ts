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

export const DEFAULT_ASSETS = ["XLM", "USDC"];

/** The issuer the form prefills for an issued asset, per network. Circle's USDC on both. */
const KNOWN_ISSUERS: Record<string, Record<string, string>> = {
  testnet: { USDC: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
  mainnet: { USDC: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
  public: { USDC: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN" },
};

export function knownIssuer(network: string, code: string): string | undefined {
  return KNOWN_ISSUERS[network]?.[code];
}

/** `XLM` needs no issuer; everything else is `CODE:ISSUER`. */
export function assetText(code: string, issuer: string): string {
  return code === "XLM" ? "XLM" : `${code}:${issuer.trim()}`;
}
