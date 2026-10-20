import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { ErrorState } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { walletStore } from "@/features/session/wallet-store";
import { keys } from "@/features/tenant/queries";
import { formatAmount, subtract } from "@/lib/amount";
import { moneyApi } from "@/lib/api/money";
import type { BalanceRow, Tenant } from "@/lib/api/types";
import { shortAddress } from "@/lib/format";
import { transferMessage } from "@/lib/stellar/messages";

interface ConfirmSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant;
  balance: BalanceRow;
  to: string;
  amount: string;
  onSent: () => void;
}

const POLL_MS = 1000;
// A transfer admitted just before its expiry can still commit one gateway
// wait later.
const PIPELINE_WAIT_MS = 2000;

/** A 202 is "still committing", not a result. Past the expiry it never will. */
async function awaitCommit(tenantId: string, id: string, expiresAt: string): Promise<void> {
  const deadline = new Date(expiresAt).getTime() + PIPELINE_WAIT_MS;
  while (Date.now() < deadline) {
    if (await moneyApi.getTransfer(tenantId, id)) return;
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  throw new Error("The transfer did not go through. Nothing was sent; you can try again.");
}

export function ConfirmSendDialog({ open, onOpenChange, tenant, balance, to, amount, onSent }: ConfirmSendDialogProps) {
  const session = useRequiredSession();
  const queryClient = useQueryClient();
  const shown = `${formatAmount(amount, balance.decimals)} ${balance.assetCode}`;
  // A transfer to a mistyped address is final, so the sender proves they read it.
  const [retyped, setRetyped] = useState("");
  const confirmed = retyped.trim().toUpperCase() === to.slice(-4).toUpperCase();

  // The server picks the nonce and the expiry; both are part of what gets signed.
  const context = useQuery({
    queryKey: ["tenant", tenant.id, "transfer-context", balance.channelId, to],
    queryFn: () => moneyApi.transferContext(tenant.id, balance.channelId, to),
    enabled: open,
    staleTime: 0,
  });

  const message = context.data
    ? transferMessage({
        networkPassphrase: context.data.networkPassphrase,
        channelId: balance.channelId,
        from: session.address,
        to,
        amount,
        nonce: context.data.nextNonce,
        expiresAt: context.data.expiresAt,
      })
    : null;

  const send = useMutation({
    mutationFn: async () => {
      const wallet = await walletStore.require();
      const signature = await wallet.signMessage(message!);
      const result = await moneyApi.transfer(tenant.id, balance.channelId, {
        to,
        amount,
        nonce: context.data!.nextNonce,
        expiresAt: context.data!.expiresAt,
        signature,
      });
      if (result.kind === "pending") await awaitCommit(tenant.id, result.pending.id, context.data!.expiresAt);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      queryClient.invalidateQueries({ queryKey: keys.me });
      toast.success(`Sent ${shown} to ${shortAddress(to)}`);
      setRetyped("");
      onOpenChange(false);
      onSent();
    },
  });

  const recipient = context.data?.recipient;
  const refused = recipient && !recipient.canReceive;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setRetyped("");
        onOpenChange(next);
      }}
      width={520}
      title={
        <>
          Send <span className="num">{shown}</span>?
        </>
      }
      description="Instant and final. There is no pending state and no way to recall it."
      footer={
        <>
          <Button variant="outline" className="h-11" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="h-11"
            loading={send.isPending}
            disabled={!message || !!refused || !confirmed}
            onClick={() => send.mutate()}
          >
            Sign & send
          </Button>
        </>
      }
    >
      <KeyValueList>
        <KeyValue label="To">{shortAddress(to)}</KeyValue>
        <KeyValue label="They are" mono={false}>
          {refused ? (
            <span className="text-destructive">{recipient.reason ?? "Cannot receive here"}</span>
          ) : recipient?.known ? (
            <span className="text-success">A member of {tenant.name}</span>
          ) : (
            <span className="inline-flex items-start gap-1.5 text-warning">
              <UserPlus className="mt-0.5 size-[13px] shrink-0" aria-hidden />
              New here — this transfer creates their account
            </span>
          )}
        </KeyValue>
        <KeyValue label="Fee" mono={false}>
          None
        </KeyValue>
        <KeyValue label="Your balance after">
          {formatAmount(subtract(balance.amount, amount), balance.decimals)} {balance.assetCode}
        </KeyValue>
      </KeyValueList>

      <Field label="Retype the last four characters of the address" hint="Sent to the wrong address, it is gone.">
        <Input
          name="retype"
          autoComplete="off"
          spellCheck={false}
          placeholder={`…${to.slice(-4)}`}
          maxLength={4}
          value={retyped}
          onChange={(event) => setRetyped(event.target.value)}
        />
      </Field>

      <div className="rounded-xl border border-border bg-background px-3.5 py-3">
        <p className="num mb-1.5 text-[12px] font-medium tracking-[0.2em] text-info uppercase">What you are signing</p>
        <p className="num text-xs leading-[1.6] break-all text-muted-foreground">{message ?? "…"}</p>
        <p className="mt-2 text-xs text-dim">A message, not a Stellar transaction.</p>
      </div>

      {context.isError && <ErrorState error={context.error} />}
      {send.isError && <ErrorState error={send.error} />}
    </Dialog>
  );
}
