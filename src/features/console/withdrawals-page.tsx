import { Inbox } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Pill, type Tone } from "@/components/ui/pill";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { TableWrap, Td, Th, THead, Tr } from "@/components/ui/table";
import { AddressText, AmountText, CopyButton } from "@/components/ui/text";
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

/** Address with its copy button; the full value stays in the tooltip. */
function CopyableAddress({ address }: { address: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <AddressText address={address} className="text-[15px]" />
      <CopyButton value={address} />
    </span>
  );
}

export function WithdrawalsPage() {
  const tenant = useCurrentTenant();
  const queue = useQueue(tenant.id);
  const assets = useBalanceAssets(tenant.id);
  const [deciding, setDeciding] = useState<QueueRow | null>(null);

  const rows = queue.data?.items ?? [];

  return (
    <Page title="Withdrawals" subtitle="Requests to leave the channel. Approving one debits the member and queues the payout.">
      {queue.isPending && <Skeleton className="h-64 rounded-2xl" />}
      {queue.isError && <ErrorState error={queue.error} />}
      {queue.data && rows.length === 0 && <EmptyState icon={<Inbox className="size-5" aria-hidden />} title="No withdrawal requests yet" />}

      {rows.length > 0 && (
        <TableWrap>
          <THead>
            <tr>
              <Th>Member</Th>
              <Th>Pays to</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th className="text-right">Requested</Th>
              <Th />
            </tr>
          </THead>
          <tbody>
            {rows.map((row) => {
              const asset = assets.get(row.channelId);
              return (
                <Tr key={row.id}>
                  <Td><CopyableAddress address={row.address} /></Td>
                  <Td><CopyableAddress address={row.destination} /></Td>
                  <Td className="text-right">
                    <AmountText units={row.amount} decimals={asset?.decimals ?? 7} code={asset?.assetCode} />
                  </Td>
                  <Td><Pill tone={STATUS[row.status].tone}>{STATUS[row.status].label}</Pill></Td>
                  <Td className="text-right text-[15px] text-muted-foreground">{timeAgo(row.requestedAt)}</Td>
                  <Td className="text-right">
                    {row.status === "requested" && (
                      <Button size="sm" variant="outline" onClick={() => setDeciding(row)}>Review</Button>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableWrap>
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
