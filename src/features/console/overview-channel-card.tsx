import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { AmountText } from "@/components/ui/text";
import type { ChannelOverview } from "@/lib/api/types";

export function OverviewChannelCard({ channel }: { channel: ChannelOverview }) {
  const amount = (units: string) => <AmountText units={units} decimals={channel.decimals} />;
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{channel.assetCode}</CardTitle>
        <ReconciliationPill status={channel.lastReconciliation ?? null} />
      </div>
      <p className="num mt-4 text-[30px] leading-none font-semibold text-foreground">{amount(channel.totalLocked)}</p>
      <p className="mt-1.5 text-xs text-dim">held by the escrow on chain</p>

      <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-sidebar-border pt-4">
        <Figure label="Members' balances">{amount(channel.userTotal)}</Figure>
        <Figure label="Being withdrawn">{amount(channel.inFlight)}</Figure>
        <Figure label="Members">{channel.memberCount}</Figure>
      </dl>
    </Card>
  );
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="num mt-1 text-sm text-foreground [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

function ReconciliationPill({ status }: { status: ChannelOverview["lastReconciliation"] | null }) {
  if (status === "ok") return <Pill tone="ok">Books match the chain</Pill>;
  if (status === "drift") return <Pill tone="danger" icon={TriangleAlert}>Books differ from the chain</Pill>;
  return <Pill>Not checked yet</Pill>;
}
