import { ArrowUpRight, Download, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { GettingStarted } from "@/features/onboarding/getting-started";
import { useBalances, useChannels } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { BalanceAssetCard } from "./balance-asset-card";

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
            <Button variant="secondary">
              <Download className="size-[15px]" aria-hidden />
              Deposit
            </Button>
          </Link>
          <Link to="send">
            <Button>
              <ArrowUpRight className="size-[15px]" aria-hidden />
              Send
            </Button>
          </Link>
        </>
      }
    >
      <GettingStarted />

      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">Assets</h2>
        <p className="text-xs text-muted-foreground">Each asset is its own channel</p>
      </div>

      {balances.isPending && (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-[176px] rounded-2xl" />
          <Skeleton className="h-[176px] rounded-2xl" />
        </div>
      )}
      {balances.isError && <ErrorState error={balances.error} />}
      {balances.data?.length === 0 && (
        <EmptyState title="No assets are open here yet" icon={<Layers className="size-5" aria-hidden />}>
          Once the operator opens one, it appears in this list.
        </EmptyState>
      )}

      <ul className="grid gap-3 md:grid-cols-2">
        {balances.data?.map((row) => (
          <li key={row.channelId}>
            <BalanceAssetCard row={row} channel={channels.data?.find((c) => c.id === row.channelId)} />
          </li>
        ))}
      </ul>
    </Page>
  );
}
