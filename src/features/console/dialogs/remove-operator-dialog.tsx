import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Note } from "@/components/ui/note";
import { ErrorState } from "@/components/ui/states";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { channelsApi } from "@/lib/api/channels";
import type { Tenant } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
import { useRefreshTenant } from "../queries";

interface Props {
  tenant: Tenant;
  operator: string;
  onClose: () => void;
}

export function RemoveOperatorDialog({ tenant, operator, onClose }: Props) {
  const refresh = useRefreshTenant(tenant.id);
  const remove = useSubmitTx(() => channelsApi.prepareRemoveOperator(tenant.id, operator));
  const isOurs = operator === tenant.operatorAddress;

  const submit = () =>
    remove.mutate(undefined, {
      onSuccess: () => {
        toast.success("Operator removed on chain");
        refresh();
        onClose();
      },
    });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Remove ${shortAddress(operator)}`}
      description="The escrow stops accepting payouts signed by this key."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={remove.isPending} onClick={submit}>Sign removal</Button>
        </>
      }
    >
      {isOurs && (
        <Note tone="danger" label="This is the key Cell pays out with">
          Removing it stops every payout for this tenant until it is added back. Deposits and transfers keep working.
        </Note>
      )}
      {remove.isError && <ErrorState error={remove.error} />}
    </Dialog>
  );
}
