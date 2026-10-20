import { ChevronDown } from "lucide-react";
import { AssetTile } from "@/components/ui/asset-tile";
import { formatAmount } from "@/lib/amount";
import type { BalanceRow } from "@/lib/api/types";

interface AssetSelectProps {
  balances: BalanceRow[];
  value: string;
  onChange: (channelId: string) => void;
  /** Which figure to show under the asset. */
  show: "channel" | "wallet";
}

/** Asset picker drawn as a 44px box; a transparent native select sits on top so keyboard and touch pickers keep working. */
export function AssetSelect({ balances, value, onChange, show }: AssetSelectProps) {
  const current = balances.find((row) => row.channelId === value) ?? balances[0];
  return (
    <span className="relative flex h-11 items-center gap-2.5 rounded-[10px] border border-border bg-background px-3.5 focus-within:border-primary">
      {current && <AssetTile code={current.assetCode} size={26} />}
      <span className="text-sm font-semibold text-foreground">{current?.assetCode}</span>
      <span className="num ml-auto min-w-0 truncate text-xs text-muted-foreground">{current && caption(current, show)}</span>
      <ChevronDown className="size-3.5 shrink-0 text-dim" aria-hidden />
      <select
        name="asset"
        aria-label="Asset"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      >
        {balances.map((row) => (
          <option key={row.channelId} value={row.channelId}>
            {row.assetCode} — {caption(row, show)}
          </option>
        ))}
      </select>
    </span>
  );
}

function caption(row: BalanceRow, show: "channel" | "wallet"): string {
  if (show === "channel") return `${formatAmount(row.amount, row.decimals)} in channel`;
  return row.walletBalance == null ? "wallet balance unavailable" : `${formatAmount(row.walletBalance, row.decimals)} in wallet`;
}
