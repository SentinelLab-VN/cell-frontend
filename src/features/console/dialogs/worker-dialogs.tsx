import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { ErrorState } from "@/components/ui/states";
import { tenantsApi } from "@/lib/api/tenants";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  onClose: () => void;
}

/** D2. A fresh tree is the cheapest way out of a suspected proof problem. */
export function RotateTreeDialog({ tenantId, onClose }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const rotate = useMutation({
    mutationFn: () => tenantsApi.rotateTree(tenantId),
    onSuccess: () => {
      toast.success("Rotation queued — it runs once nothing is in flight");
      refresh();
      onClose();
    },
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Start a new tree"
      description="Cell signs reset_smt_root with this tenant's key. Nobody loses anything: approved withdrawals have no nonce yet, and paid ones are already on chain."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={rotate.isPending} onClick={() => rotate.mutate()}>Rotate</Button>
        </>
      }
    >
      <Note tone="warn" label="Use it for a reason">
        Every unused number in the current tree is retired. Payouts pause until the chain reports the new tree.
      </Note>
      {rotate.isError && <ErrorState error={rotate.error} />}
    </Dialog>
  );
}

/** Clears a halt after a human has dealt with what caused it. */
export function ResumeWorkerDialog({ tenantId, onClose }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const [incident, setIncident] = useState("");
  const resume = useMutation({
    mutationFn: () => tenantsApi.resumeReleaseWorker(tenantId, incident.trim()),
    onSuccess: () => {
      toast.success("Payouts resumed");
      refresh();
      onClose();
    },
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Resume payouts"
      description="The worker stopped because something needed a decision. Say what was decided; it goes in the audit log."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={resume.isPending} disabled={!incident.trim()} onClick={() => resume.mutate()}>
            Resume
          </Button>
        </>
      }
    >
      <Field label="What was dealt with">
        <Input name="incident" placeholder="e.g. drift on USDC traced to a replayed deposit, books corrected" value={incident} onChange={(event) => setIncident(event.target.value)} />
      </Field>
      {resume.isError && <ErrorState error={resume.error} />}
    </Dialog>
  );
}
