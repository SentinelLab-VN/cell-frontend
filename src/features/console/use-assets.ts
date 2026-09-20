import { useChannels } from "@/features/tenant/queries";

export interface AssetInfo {
  assetCode: string;
  decimals: number;
}

/** Channel id → how to print an amount held in it. */
export function useBalanceAssets(tenantId: string): Map<string, AssetInfo> {
  const { data } = useChannels(tenantId);
  return new Map((data ?? []).map((c) => [c.id, { assetCode: c.assetCode, decimals: c.decimals }]));
}
