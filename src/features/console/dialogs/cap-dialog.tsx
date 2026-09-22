import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { ErrorState } from "@/components/ui/states";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { formatAmount, parseAmount } from "@/lib/amount";
import { channelsApi } from "@/lib/api/channels";
import type { Channel } from "@/lib/api/types";
import { useRefreshTenant } from "../queries";

interface Props {
  tenantId: string;
  channel: Channel;
  onClose: () => void;
}

/**
 * Change the largest single payout. On chain this is `allow_mint` again, which
 * moves the cap and leaves both gates as they are.
 */
export function CapDialog({ tenantId, channel, onClose }: Props) {
  const refresh = useRefreshTenant(tenantId);
  const current = channel.releaseCap && channel.releaseCap !== "0" ? channel.releaseCap : null;
  const [capText, setCapText] = useState(current ? formatAmount(current, channel.decimals, 0) : "");

  const cap = capText.trim() === "" ? "0" : parseAmount(capText, channel.decimals);
  const unchanged = cap === (current ?? "0");
  const share = cap && cap !== "0" && BigInt(channel.totalLocked) > 0n
    ? Number((BigInt(cap) * 10_000n) / BigInt(channel.totalLocked)) / 100
    : null;

  const save = useSubmitTx(() => channelsApi.prepareSetCap(tenantId, channel.id, cap ?? "0"));
  const submit = () =>
    save.mutate(undefined, {
      onSuccess: () => {
        toast.success("Sent to the network — it shows here in a few seconds");
        refresh();
        onClose();
      },
    });

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Largest single payout for ${channel.assetCode}`}
      description="The escrow refuses any one payout above this. It limits what a single compromised operator signature can move; it does not limit how much a member can withdraw in total."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} disabled={cap === null || unchanged} onClick={submit}>Sign in wallet</Button>
        </>
      }
    >
      <Field
        label="Largest single payout"
        hint={
          cap === null
            ? "Not a valid amount"
            : cap === "0"
              ? "Empty means no limit"
              : share !== null
                ? `${share}% of the ${formatAmount(channel.totalLocked, channel.decimals)} ${channel.assetCode} the escrow holds now`
                : undefined
        }
      >
        <Input
          name="cap"
          inputMode="decimal"
          placeholder="no limit"
          value={capText}
          onChange={(e) => setCapText(e.target.value)}
        />
      </Field>
      {save.isError && <ErrorState error={save.error} />}
    </Dialog>
  );
}
