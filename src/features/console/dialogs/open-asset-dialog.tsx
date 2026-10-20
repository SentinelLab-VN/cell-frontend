import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { AssetPicker } from "@/features/chain/asset-picker";
import { useOpenAsset } from "@/features/chain/use-open-asset";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenAssetDialog({ tenantId, open, onOpenChange }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const form = useOpenAsset(tenantId);

  const submit = () =>
    form.open.mutate(undefined, {
      onSuccess: () => {
        toast.success("Asset opened — it goes live once the indexer sees it");
        refresh();
        onOpenChange(false);
        form.setCapText("");
      },
    });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      width={480}
      title="Open an asset"
      description="Tells the escrow to accept this asset. Each asset gets its own channel and its own books."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={form.open.isPending} disabled={!form.valid} onClick={submit}>Sign in wallet</Button>
        </>
      }
    >
      <AssetPicker
        assets={form.assets}
        code={form.code}
        onCode={form.setCode}
        issuer={form.issuer}
        onIssuer={form.setIssuer}
        needsIssuer={form.needsIssuer}
      />
      <Field label="Largest single payout" hint="Leave empty for no limit">
        <Input name="cap" inputMode="decimal" placeholder="no limit" value={form.capText} onChange={(e) => form.setCapText(e.target.value)} />
      </Field>
      {form.open.isError && <ErrorState error={form.open.error} />}
    </Dialog>
  );
}
