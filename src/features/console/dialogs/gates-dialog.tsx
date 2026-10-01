import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ToggleRow } from "@/components/ui/switch";
import { ErrorState } from "@/components/ui/states";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { channelsApi } from "@/lib/api/channels";
import type { Channel } from "@/lib/api/types";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  channel: Channel;
  onClose: () => void;
}

export function GatesDialog({ tenantId, channel, onClose }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const [depositsBlocked, setDepositsBlocked] = useState(channel.depositsBlocked);
  const [withdrawalsBlocked, setWithdrawalsBlocked] = useState(channel.withdrawalsBlocked);

  const save = useSubmitTx(() => channelsApi.prepareGates(tenantId, channel.id, { depositsBlocked, withdrawalsBlocked }));
  const submit = () =>
    save.mutate(undefined, {
      onSuccess: () => {
        toast.success("Sent to the network — it shows here in a few seconds");
        refresh();
        onClose();
      },
    });

  const unchanged = depositsBlocked === channel.depositsBlocked && withdrawalsBlocked === channel.withdrawalsBlocked;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      width={480}
      title={`Pause or resume ${channel.assetCode}`}
      description="The escrow itself enforces this. Balances and transfers inside the channel are not affected."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} disabled={unchanged} onClick={submit}>Sign in wallet</Button>
        </>
      }
    >
      <ToggleRow label="Pause deposits" checked={depositsBlocked} onChange={setDepositsBlocked} />
      <ToggleRow label="Pause withdrawals" checked={withdrawalsBlocked} onChange={setWithdrawalsBlocked} />
      {save.isError && <ErrorState error={save.error} />}
    </Dialog>
  );
}
