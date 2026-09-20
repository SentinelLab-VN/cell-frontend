import { ChevronDown } from "lucide-react";
import { formatAmount } from "@/lib/amount";
import type { BalanceRow } from "@/lib/api/types";

interface AssetSelectProps {
  balances: BalanceRow[];
  value: string;
  onChange: (channelId: string) => void;
  /** Which figure to show under the asset. */
  show: "channel" | "wallet";
}

export function AssetSelect({ balances, value, onChange, show }: AssetSelectProps) {
  return (
    <span className="relative block">
      <select
        name="asset"
        aria-label="Asset"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[58px] w-full appearance-none rounded-[10px] border border-border bg-background pr-10 pl-4 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/30"
      >
        {balances.map((row) => (
          <option key={row.channelId} value={row.channelId}>
            {row.assetCode} — {caption(row, show)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-dim" aria-hidden />
    </span>
  );
}

function caption(row: BalanceRow, show: "channel" | "wallet"): string {
  if (show === "channel") return `${formatAmount(row.amount, row.decimals)} in channel`;
  return row.walletBalance == null ? "wallet balance unavailable" : `${formatAmount(row.walletBalance, row.decimals)} in wallet`;
}
