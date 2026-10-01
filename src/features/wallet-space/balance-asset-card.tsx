import { Pause } from "lucide-react";
import { AssetTile } from "@/components/ui/asset-tile";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { AmountText } from "@/components/ui/text";
import type { BalanceRow, Channel } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";

/** One asset's channel: what is held in it, what is left in the wallet, and whether it is open. */
export function BalanceAssetCard({ row, channel }: { row: BalanceRow; channel?: Channel }) {
  return (
    <Card hover className="p-[22px_24px]">
      <div className="flex items-center gap-3">
        <AssetTile code={row.assetCode} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-foreground">{row.assetCode}</p>
          <p className="num truncate text-[13px] text-dim">{channel ? shortAddress(channel.tokenContractId) : " "}</p>
        </div>
        <GatePill channel={channel} />
      </div>

      <p className="mt-[22px] text-xs text-muted-foreground">In channel</p>
      <p className="mt-1.5 flex items-baseline gap-2">
        <AmountText
          units={row.amount}
          decimals={row.decimals}
          className="text-[38px] leading-none font-semibold tracking-[-0.02em] text-foreground max-md:text-[34px]"
        />
        <span className="text-[17px] font-medium text-muted-foreground">{row.assetCode}</span>
      </p>

      <div className="mt-[18px] flex items-baseline justify-between border-t border-sidebar-border pt-3.5">
        <span className="text-xs text-muted-foreground">In wallet</span>
        <span className="num text-[15px] text-text-secondary">
          {row.walletBalance == null ? "—" : <AmountText units={row.walletBalance} decimals={row.decimals} />}
        </span>
      </div>
    </Card>
  );
}

function GatePill({ channel }: { channel?: Channel }) {
  if (!channel) return null;
  if (channel.status !== "active") return <Pill tone="warn">{channel.status}</Pill>;
  if (channel.depositsBlocked) return <Pill tone="warn" icon={Pause}>Deposits paused</Pill>;
  if (channel.withdrawalsBlocked) return <Pill tone="danger">Withdrawals paused</Pill>;
  return <Pill tone="ok">Open</Pill>;
}
