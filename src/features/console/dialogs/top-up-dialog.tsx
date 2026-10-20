import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { isPositive, parseAmount } from "@/lib/amount";
import { channelsApi } from "@/lib/api/channels";
import type { Tenant } from "@/lib/api/types";
import { formatXlm } from "@/lib/format";
import { useRefreshTenant } from "../queries";

export function TopUpDialog({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const refresh = useRefreshTenant(tenant.id);
  const [amountText, setAmountText] = useState("10");
  const amount = parseAmount(amountText, 7);

  const fund = useSubmitTx(() => channelsApi.prepareFundOperator(tenant.id, amount!));
  const submit = () =>
    fund.mutate(undefined, {
      onSuccess: () => {
        toast.success("Sent — the new balance shows in a few seconds");
        refresh();
        onClose();
      },
    });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      width={480}
      title="Top up the operator account"
      description={`It pays the network fee of every payout and never holds members' money. Balance now: ${formatXlm(tenant.operatorBalance)}.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={fund.isPending} disabled={!amount || !isPositive(amount)} onClick={submit}>Sign in wallet</Button>
        </>
      }
    >
      <Field label="Amount">
        <Input name="amount" inputMode="decimal" trailing="XLM" value={amountText} onChange={(e) => setAmountText(e.target.value)} />
      </Field>
      {fund.isError && <ErrorState error={fund.error} />}
    </Dialog>
  );
}
