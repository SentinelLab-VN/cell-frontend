import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { ErrorState } from "@/components/ui/states";
import { AddressText, AmountText } from "@/components/ui/text";
import { operatorApi } from "@/lib/api/operator";
import type { QueueRow } from "@/lib/api/types";
import { useRefreshTenant } from "../queries";
import type { AssetInfo } from "../use-assets";

interface Props {
  tenantId: string;
  row: QueueRow;
  asset?: AssetInfo;
  onClose: () => void;
}

export function DecideDialog({ tenantId, row, asset, onClose }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const decide = useMutation({
    mutationFn: (approve: boolean) =>
      approve ? operatorApi.approve(tenantId, row.id) : operatorApi.reject(tenantId, row.id, reason.trim()),
    onSuccess: (_, approved) => {
      toast.success(approved ? "Approved — the payout is queued" : "Rejected — the member keeps the balance");
      refresh();
      onClose();
    },
  });

  const amount = (units: string) => <AmountText units={units} decimals={asset?.decimals ?? 7} code={asset?.assetCode} />;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Review withdrawal"
      description="Approving debits the member now and pays them on Stellar. It cannot be undone once paid."
      footer={
        rejecting ? (
          <>
            <Button variant="ghost" onClick={() => setRejecting(false)}>Back</Button>
            <Button variant="danger" loading={decide.isPending} disabled={!reason.trim()} onClick={() => decide.mutate(false)}>
              Reject request
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" onClick={() => setRejecting(true)}>Reject…</Button>
            <Button loading={decide.isPending} onClick={() => decide.mutate(true)}>Approve payout</Button>
          </>
        )
      }
    >
      <KeyValueList>
        <KeyValue label="Member"><AddressText address={row.address} /></KeyValue>
        <KeyValue label="Pays to"><AddressText address={row.destination} /></KeyValue>
        <KeyValue label="Amount">{amount(row.amount)}</KeyValue>
        <KeyValue label="Member's balance now">{amount(row.requesterBalance)}</KeyValue>
      </KeyValueList>
      {rejecting && (
        <Field label="Reason" hint="The member sees this.">
          <Input name="reason" autoFocus value={reason} onChange={(event) => setReason(event.target.value)} />
        </Field>
      )}
      {decide.isError && <ErrorState error={decide.error} />}
    </Dialog>
  );
}
