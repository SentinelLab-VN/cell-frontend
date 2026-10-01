import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { operatorApi } from "@/lib/api/operator";
import type { MemberRow } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  member: MemberRow;
  onClose: () => void;
}

export function BlockDialog({ tenantId, member, onClose }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const [reason, setReason] = useState("");

  const block = useMutation({
    mutationFn: () => operatorApi.block(tenantId, member.address, reason.trim() || undefined),
    onSuccess: () => {
      toast.success("Address blocked");
      refresh();
      onClose();
    },
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      width={480}
      title={`Block ${shortAddress(member.address)}`}
      description="A blocked address cannot send, receive or withdraw. Its balance stays where it is, and unblocking restores everything."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={block.isPending} onClick={() => block.mutate()}>Block address</Button>
        </>
      }
    >
      <Field label="Note" hint="Optional. Only operators see it.">
        <Input name="note" value={reason} onChange={(event) => setReason(event.target.value)} />
      </Field>
      {block.isError && <ErrorState error={block.error} />}
    </Dialog>
  );
}
