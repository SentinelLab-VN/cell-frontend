import { Plus } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/states";
import { CHAIN_POLL_MS, keys } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { channelsApi } from "@/lib/api/channels";
import type { Channel } from "@/lib/api/types";
import { useQuery } from "@tanstack/react-query";
import { ChannelCard } from "./channel-card";
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
            <Plus className="size-[15px]" aria-hidden /> Open an asset
          </Button>
        )
      }
    >
      {channels.isPending && (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => <Skeleton key={i} className="h-[300px] rounded-2xl" />)}
        </div>
      )}
      {channels.isError && <ErrorState error={channels.error} />}

      <div className="grid gap-4 md:grid-cols-2">
        {channels.data?.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onPause={isAdmin && channel.status !== "provisioning" ? () => setGatesFor(channel) : undefined}
            onChangeCap={isAdmin && channel.status !== "provisioning" ? () => setCapFor(channel) : undefined}
          />
        ))}
      </div>

      <OpenAssetDialog tenantId={tenant.id} open={opening} onOpenChange={setOpening} />
      {gatesFor && <GatesDialog tenantId={tenant.id} channel={gatesFor} onClose={() => setGatesFor(null)} />}
      {capFor && <CapDialog tenantId={tenant.id} channel={capFor} onClose={() => setCapFor(null)} />}
    </Page>
  );
}
