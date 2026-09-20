import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
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

export function ConfirmSendDialog({ open, onOpenChange, tenant, balance, to, amount, onSent }: ConfirmSendDialogProps) {
  const session = useRequiredSession();
  const queryClient = useQueryClient();
  const shown = `${formatAmount(amount, balance.decimals)} ${balance.assetCode}`;

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
      return moneyApi.transfer(tenant.id, balance.channelId, {
        to,
        amount,
        nonce: context.data!.nextNonce,
        expiresAt: context.data!.expiresAt,
        signature,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      queryClient.invalidateQueries({ queryKey: keys.me });
      toast.success(`Sent ${shown} to ${shortAddress(to)}`);
      onOpenChange(false);
      onSent();
    },
  });

  const recipient = context.data?.recipient;
  const refused = recipient && !recipient.canReceive;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Send ${shown}?`}
      description="Instant and final. There is no pending state and no way to recall it."
      footer={
        <>
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="lg" loading={send.isPending} disabled={!message || !!refused} onClick={() => send.mutate()}>
            Sign & send
          </Button>
        </>
      }
    >
      <KeyValueList>
        <KeyValue label="To">{shortAddress(to)}</KeyValue>
        <KeyValue label="They are" mono>
          {refused ? (
            <span className="text-destructive">{recipient.reason ?? "Cannot receive here"}</span>
          ) : recipient?.known ? (
            <span className="text-success">A member of {tenant.name}</span>
          ) : (
            <span className="text-warning">New here — this transfer creates their account</span>
          )}
        </KeyValue>
        <KeyValue label="Fee" mono={false}>
          None
        </KeyValue>
        <KeyValue label="Your balance after">
          {formatAmount(subtract(balance.amount, amount), balance.decimals)} {balance.assetCode}
        </KeyValue>
      </KeyValueList>

      <div className="rounded-xl border border-border bg-background px-4 py-3.5">
        <p className="num mb-1.5 text-[10px] tracking-[0.2em] text-info uppercase">What you are signing</p>
        <p className="num text-xs leading-relaxed break-all text-muted-foreground">{message ?? "…"}</p>
        <p className="mt-2 text-xs text-dim">A message, not a Stellar transaction.</p>
      </div>

      {context.isError && <ErrorState error={context.error} />}
      {send.isError && <ErrorState error={send.error} />}
    </Dialog>
  );
}
