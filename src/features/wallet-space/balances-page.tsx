import { Link } from "react-router-dom";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { AmountText } from "@/components/ui/text";
import { useBalances, useChannels } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import type { BalanceRow, Channel } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";

export function BalancesPage() {
  const tenant = useCurrentTenant();
  const balances = useBalances(tenant.id, true);
  const channels = useChannels(tenant.id);

  return (
    <Page
      title="Balances"
      subtitle={`Held for you inside ${tenant.name}'s channel`}
      actions={
        <>
          <Link to="deposit">
            <Button variant="secondary" size="lg">
              Deposit
            </Button>
          </Link>
          <Link to="send">
            <Button size="lg">Send</Button>
          </Link>
        </>
      }
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-foreground">Assets</h2>
        <p className="text-xs text-dim">Each asset is its own channel</p>
      </div>

      {balances.isPending && <Skeleton className="h-[74px]" />}
      {balances.isError && <ErrorState error={balances.error} />}
      {balances.data?.length === 0 && (
        <EmptyState title="No assets are open here yet">Once the operator opens one, it appears in this list.</EmptyState>
      )}

      <ul className="space-y-2.5">
        {balances.data?.map((row) => (
          <li key={row.channelId}>
            <AssetRow row={row} channel={channels.data?.find((c) => c.id === row.channelId)} />
          </li>
        ))}
      </ul>
    </Page>
  );
}

function AssetRow({ row, channel }: { row: BalanceRow; channel?: Channel }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
      <span className="size-[38px] shrink-0 rounded-[10px] bg-secondary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-foreground">{row.assetCode}</p>
        <p className="num text-xs text-dim">{channel ? shortAddress(channel.tokenContractId) : " "}</p>
      </div>

      <Figure label="in wallet">
        {row.walletBalance == null ? "—" : <AmountText units={row.walletBalance} decimals={row.decimals} />}
      </Figure>
      <Figure label="in channel" strong>
        <AmountText units={row.amount} decimals={row.decimals} />
      </Figure>

      <GatePill channel={channel} />
    </div>
  );
}

function Figure({ label, strong = false, children }: { label: string; strong?: boolean; children: React.ReactNode }) {
  return (
    <div className="w-36 text-right">
      <p className="text-[11px] text-dim">{label}</p>
      <p className={strong ? "text-base text-foreground" : "text-[13px] text-muted-foreground"}>{children}</p>
    </div>
  );
}

function GatePill({ channel }: { channel?: Channel }) {
  if (!channel) return <span className="w-32" />;
  if (channel.status !== "active") return <Pill tone="warn">{channel.status}</Pill>;
  if (channel.depositsBlocked) return <Pill tone="warn">Deposits paused</Pill>;
  if (channel.withdrawalsBlocked) return <Pill tone="danger">Withdrawals paused</Pill>;
  return <Pill tone="ok">Open</Pill>;
}
