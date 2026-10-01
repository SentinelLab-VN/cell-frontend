import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { Note } from "@/components/ui/note";
import { useChannels } from "@/features/tenant/queries";
import { formatAmount } from "@/lib/amount";
import type { Tenant } from "@/lib/api/types";
import { formatXlm, shortAddress } from "@/lib/format";

export function StepLive({ tenant }: { tenant: Tenant }) {
  const { data: channels } = useChannels(tenant.id);
  const opened = channels
    ?.map((c) => `${c.assetCode} · ${c.releaseCap ? `cap ${formatAmount(c.releaseCap, c.decimals)}` : "no cap"}`)
    .join(", ");

  return (
    <>
      <Card>
        <CardTitle>{tenant.name} is live</CardTitle>
        <KeyValueList className="mt-5">
          <KeyValue label="Escrow">{shortAddress(tenant.escrowContractId)}</KeyValue>
          <KeyValue label="Network">{tenant.network}</KeyValue>
          <KeyValue label="Admin">{tenant.adminAddress ? `${shortAddress(tenant.adminAddress)}  (cold)` : "—"}</KeyValue>
          <KeyValue label="Operator">
            {tenant.operatorAddress ? `${shortAddress(tenant.operatorAddress)}  (hot)` : "—"}
          </KeyValue>
          <KeyValue label="Operator balance">{formatXlm(tenant.operatorBalance)}</KeyValue>
          <KeyValue label="Channels open">{opened ?? "—"}</KeyValue>
        </KeyValueList>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Link to={`/t/${tenant.id}`}>
            <Button variant="outline" size="lg" block>
              View as user
            </Button>
          </Link>
          <Link to={`/t/${tenant.id}/console`}>
            <Button size="lg" block>
              Open console
            </Button>
          </Link>
        </div>
      </Card>

      <Note tone="info" label="Nobody can be paid yet">
        Your users hold nothing until someone deposits. Open the console and copy the tenant link for them — anyone who
        opens it can deposit. Or deposit yourself and transfer it on; that first transfer is what creates their account.
      </Note>
    </>
  );
}
