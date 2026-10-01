import { Plus } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { Pill } from "@/components/ui/pill";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { AddressText, AmountText } from "@/components/ui/text";
import { CHAIN_POLL_MS, keys } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { channelsApi } from "@/lib/api/channels";
import type { Channel } from "@/lib/api/types";
import { useQuery } from "@tanstack/react-query";
import { CapDialog } from "./dialogs/cap-dialog";
import { GatesDialog } from "./dialogs/gates-dialog";
import { OpenAssetDialog } from "./dialogs/open-asset-dialog";

export function ChannelsPage() {
  const tenant = useCurrentTenant();
  const isAdmin = tenant.role === "admin";
  const channels = useQuery({
    queryKey: keys.channels(tenant.id),
    queryFn: () => channelsApi.list(tenant.id),
    refetchInterval: CHAIN_POLL_MS,
  });
  const [opening, setOpening] = useState(false);
  const [gatesFor, setGatesFor] = useState<Channel | null>(null);
  const [capFor, setCapFor] = useState<Channel | null>(null);

  return (
    <Page
      title="Channels"
      subtitle="One channel per asset the escrow accepts"
      actions={
        isAdmin && (
          <Button size="sm" onClick={() => setOpening(true)}>
            <Plus className="size-4" aria-hidden /> Open an asset
          </Button>
        )
      }
    >
      {channels.isPending && <Skeleton className="h-48" />}
      {channels.isError && <ErrorState error={channels.error} />}

      <div className="grid gap-4 xl:grid-cols-2">
        {channels.data?.map((channel) => (
          <Card key={channel.id}>
            <div className="flex items-center justify-between">
              <CardTitle>{channel.assetCode}</CardTitle>
              <StatusPill channel={channel} />
            </div>
            <KeyValueList className="mt-5">
              <KeyValue label="Held on chain">
                <AmountText units={channel.totalLocked} decimals={channel.decimals} code={channel.assetCode} />
              </KeyValue>
              <KeyValue label="Largest single payout">
                {channel.releaseCap ? (
                  <AmountText units={channel.releaseCap} decimals={channel.decimals} code={channel.assetCode} />
                ) : (
                  "no limit"
                )}
              </KeyValue>
              <KeyValue label="Token contract">
                <AddressText address={channel.tokenContractId} />
              </KeyValue>
              <KeyValue label="Deposits" mono={false}>{channel.depositsBlocked ? "Paused" : "Open"}</KeyValue>
              <KeyValue label="Withdrawals" mono={false}>{channel.withdrawalsBlocked ? "Paused" : "Open"}</KeyValue>
            </KeyValueList>
            {isAdmin && channel.status !== "provisioning" && (
              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setGatesFor(channel)}>
                  Pause or resume
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCapFor(channel)}>
                  Change payout limit
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <OpenAssetDialog tenantId={tenant.id} open={opening} onOpenChange={setOpening} />
      {gatesFor && <GatesDialog tenantId={tenant.id} channel={gatesFor} onClose={() => setGatesFor(null)} />}
      {capFor && <CapDialog tenantId={tenant.id} channel={capFor} onClose={() => setCapFor(null)} />}
    </Page>
  );
}

function StatusPill({ channel }: { channel: Channel }) {
  if (channel.status === "provisioning") return <Pill tone="warn">Waiting for chain</Pill>;
  if (channel.depositsBlocked || channel.withdrawalsBlocked) return <Pill tone="warn">Partly paused</Pill>;
  return <Pill tone="ok">Live</Pill>;
}
