import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Pill, type Tone } from "@/components/ui/pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { AddressText, AmountText } from "@/components/ui/text";
import { useBalanceAssets } from "./use-assets";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import type { QueueRow, WithdrawalStatus } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { DecideDialog } from "./dialogs/decide-dialog";
import { useQueue } from "./queries";

const STATUS: Record<WithdrawalStatus, { label: string; tone: Tone }> = {
  requested: { label: "Needs review", tone: "warn" },
  approved: { label: "Queued for payout", tone: "info" },
  releasing: { label: "Paying out", tone: "info" },
  released: { label: "Paid out", tone: "ok" },
  failed: { label: "Failed — refunded", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function WithdrawalsPage() {
  const tenant = useCurrentTenant();
  const queue = useQueue(tenant.id);
  const assets = useBalanceAssets(tenant.id);
  const [deciding, setDeciding] = useState<QueueRow | null>(null);

  const rows = queue.data?.items ?? [];

  return (
    <Page title="Withdrawals" subtitle="Requests to leave the channel. Approving one debits the member and queues the payout.">
      {queue.isPending && <Skeleton className="h-48" />}
      {queue.isError && <ErrorState error={queue.error} />}
      {queue.data && rows.length === 0 && <EmptyState title="No withdrawal requests yet" />}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-secondary/60">
              <tr className="num text-[10px] tracking-[0.2em] text-dim uppercase">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Pays to</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Requested</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const asset = assets.get(row.channelId);
                return (
                  <tr key={row.id} className="border-t border-border text-sm">
                    <td className="px-5 py-3.5"><AddressText address={row.address} /></td>
                    <td className="px-5 py-3.5"><AddressText address={row.destination} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <AmountText units={row.amount} decimals={asset?.decimals ?? 7} code={asset?.assetCode} />
                    </td>
                    <td className="px-5 py-3.5"><Pill tone={STATUS[row.status].tone}>{STATUS[row.status].label}</Pill></td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-muted-foreground">{timeAgo(row.requestedAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {row.status === "requested" && (
                        <Button size="sm" variant="outline" onClick={() => setDeciding(row)}>Review</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deciding && (
        <DecideDialog
          tenantId={tenant.id}
          row={deciding}
          asset={assets.get(deciding.channelId)}
          onClose={() => setDeciding(null)}
        />
      )}
    </Page>
  );
}
