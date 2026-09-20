import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { operatorApi } from "@/lib/api/operator";
import { isStellarAddress } from "@/lib/format";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ tenantId, open, onOpenChange }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const [address, setAddress] = useState("");

  const invite = useMutation({
    mutationFn: () => operatorApi.invite(tenantId, address),
    onSuccess: () => {
      toast.success("Address added");
      refresh();
      setAddress("");
      onOpenChange(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add an address"
      description="The address may sign in and hold a balance here straight away. Nothing is sent to it."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={invite.isPending} disabled={!isStellarAddress(address)} onClick={() => invite.mutate()}>
            Add address
          </Button>
        </>
      }
    >
      <Field label="Stellar address">
        <Input name="address" placeholder="G…" autoFocus value={address} onChange={(e) => setAddress(e.target.value.trim())} />
      </Field>
      {invite.isError && <ErrorState error={invite.error} />}
    </Dialog>
  );
}
