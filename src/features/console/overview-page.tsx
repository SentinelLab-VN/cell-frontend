import { Page } from "@/components/layout/page";
import { Note } from "@/components/ui/note";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { hasAnyDeposit } from "@/features/onboarding/helpers";
import { OperatorNextSteps } from "@/features/onboarding/operator-next-steps";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { OverviewChannelCard } from "./overview-channel-card";
import { OverviewStatCard } from "./overview-stat-card";
import { useOverview } from "./queries";

export function OverviewPage() {
  const tenant = useCurrentTenant();
  const overview = useOverview(tenant.id);

  if (overview.isError) return <Page title="Overview"><ErrorState error={overview.error} /></Page>;
  if (!overview.data) return <Page title="Overview"><OverviewSkeleton /></Page>;

  const { channels, queue, tree, releaseWorkerHalted } = overview.data;

  return (
    <Page title="Overview" subtitle="What the escrow holds, and what is waiting on you">
      <div className="space-y-4">
        <OperatorNextSteps hasDeposits={hasAnyDeposit(channels)} />

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
          <OverviewStatCard label="Waiting for review" value={queue.requested} to="withdrawals" />
          <OverviewStatCard label="Being paid out" value={queue.approved + queue.releasing} />
          <OverviewStatCard label="Withdrawals left in this tree" value={tree.noncesRemaining.toLocaleString()} hint={`tree #${tree.treeIndex}`} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => (
            <OverviewChannelCard key={channel.channelId} channel={channel} />
          ))}
        </div>
      </div>
    </Page>
  );
}

/** Same silhouette as the loaded page: three stats, then two channel cards. */
function OverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => <Skeleton key={i} className="h-[196px] rounded-2xl" />)}
      </div>
    </div>
  );
}
