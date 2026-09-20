import { Link } from "react-router-dom";
import { Page } from "@/components/layout/page";
import { Card, CardTitle } from "@/components/ui/card";
import { Note } from "@/components/ui/note";
import { Pill } from "@/components/ui/pill";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { AmountText } from "@/components/ui/text";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import type { ChannelOverview } from "@/lib/api/types";
import { useOverview } from "./queries";

export function OverviewPage() {
  const tenant = useCurrentTenant();
  const overview = useOverview(tenant.id);

  if (overview.isError) return <Page title="Overview"><ErrorState error={overview.error} /></Page>;
  if (!overview.data) return <Page title="Overview"><Skeleton className="h-64" /></Page>;

  const { channels, queue, tree, releaseWorkerHalted } = overview.data;

  return (
    <Page title="Overview" subtitle="What the escrow holds, and what is waiting on you">
      <div className="space-y-6">
        {releaseWorkerHalted && (
          <Note tone="danger" label="Payouts are halted">
            A release could not be settled and the worker stopped rather than guess. Nothing is lost; approved
            withdrawals stay queued until this is looked at.
          </Note>
        )}

        {!tenant.operatorFunded && (
          <Note tone="danger" label="Payouts are paused: the operator account is out of fees">
            Top it up from the Contract screen and approved withdrawals resume on their own.
          </Note>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Waiting for review" value={queue.requested} to="withdrawals" />
          <Stat label="Being paid out" value={queue.approved + queue.releasing} />
          <Stat label="Withdrawals left in this tree" value={tree.noncesRemaining.toLocaleString()} hint={`tree #${tree.treeIndex}`} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {channels.map((channel) => (
            <ChannelCard key={channel.channelId} channel={channel} />
          ))}
        </div>
      </div>
    </Page>
  );
}

function Stat({ label, value, hint, to }: { label: string; value: number | string; hint?: string; to?: string }) {
  const body = (
    <Card className={to ? "transition-colors hover:border-border-strong" : undefined}>
      <p className="num text-[10px] tracking-[0.2em] text-dim uppercase">{label}</p>
      <p className="num mt-3 text-[28px] leading-none font-semibold text-foreground">{value}</p>
      {hint && <p className="num mt-2 text-xs text-dim">{hint}</p>}
    </Card>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

function ChannelCard({ channel }: { channel: ChannelOverview }) {
  const amount = (units: string) => <AmountText units={units} decimals={channel.decimals} />;
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{channel.assetCode}</CardTitle>
        <ReconciliationPill status={channel.lastReconciliation ?? null} />
      </div>
      <p className="num mt-4 text-[26px] leading-none font-semibold text-foreground">{amount(channel.totalLocked)}</p>
      <p className="mt-1.5 text-xs text-dim">held by the escrow on chain</p>

      <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-4">
        <Figure label="Members' balances">{amount(channel.userTotal)}</Figure>
        <Figure label="Being withdrawn">{amount(channel.inFlight)}</Figure>
        <Figure label="Members">{channel.memberCount}</Figure>
      </dl>
    </Card>
  );
}

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="num mt-1 text-sm text-foreground">{children}</dd>
    </div>
  );
}

function ReconciliationPill({ status }: { status: ChannelOverview["lastReconciliation"] | null }) {
  if (status === "ok") return <Pill tone="ok">Books match the chain</Pill>;
  if (status === "drift") return <Pill tone="danger">Books differ from the chain</Pill>;
  return <Pill>Not checked yet</Pill>;
}
