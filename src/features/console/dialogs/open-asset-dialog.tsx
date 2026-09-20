import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { useOpenAsset } from "@/features/chain/use-open-asset";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpenAssetDialog({ tenantId, open, onOpenChange }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const { assetText, setAssetText, capText, setCapText, valid, open: openAsset } = useOpenAsset(tenantId);

  const submit = () =>
    openAsset.mutate(undefined, {
      onSuccess: () => {
        toast.success("Asset opened — it goes live once the indexer sees it");
        refresh();
        onOpenChange(false);
        setAssetText("");
        setCapText("");
      },
    });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Open an asset"
      description="Tells the escrow to accept this asset. Each asset gets its own channel and its own books."
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button loading={openAsset.isPending} disabled={!valid} onClick={submit}>Sign in wallet</Button>
        </>
      }
    >
      <Field label="Asset" hint="XLM, or CODE:ISSUER for an issued asset">
        <Input name="asset" placeholder="USDC:GA5Z…" value={assetText} onChange={(e) => setAssetText(e.target.value.trim())} />
      </Field>
      <Field label="Largest single payout" hint="Leave empty for no limit">
        <Input name="cap" inputMode="decimal" placeholder="no limit" value={capText} onChange={(e) => setCapText(e.target.value)} />
      </Field>
      {openAsset.isError && <ErrorState error={openAsset.error} />}
    </Dialog>
  );
}
