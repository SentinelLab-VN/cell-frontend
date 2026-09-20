import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, ReadOnlyBox } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { walletStore } from "@/features/session/wallet-store";
import { CHAIN_POLL_MS, keys } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { formatAmount, gte, isPositive, parseAmount } from "@/lib/amount";
import { moneyApi } from "@/lib/api/money";
import { isStellarAddress, shortAddress } from "@/lib/format";
import { withdrawalMessage } from "@/lib/stellar/messages";
import { AssetSelect } from "./asset-select";
import { useChannelChoice } from "./use-channel-choice";
import { WithdrawalProgress } from "./withdrawal-progress";

export function WithdrawPage() {
  const tenant = useCurrentTenant();
  const session = useRequiredSession();
  const queryClient = useQueryClient();
  const { balances, rows, selected, choose } = useChannelChoice(tenant.id, true);
  const [amountText, setAmountText] = useState("");
  const [destination, setDestination] = useState<string | null>(null);

  const withdrawals = useQuery({
    queryKey: keys.withdrawals(tenant.id),
    queryFn: () => moneyApi.withdrawals(tenant.id),
    refetchInterval: CHAIN_POLL_MS,
  });

  const amount = selected ? parseAmount(amountText, selected.decimals) : null;
  const to = destination ?? session.address;
  const affordable = !!selected && !!amount && isPositive(amount) && gte(selected.amount, amount);

  const request = useMutation({
    mutationFn: async () => {
      const channelId = selected!.channelId;
      // The server picks the request id and the expiry; both are signed.
      const [context, wallet] = await Promise.all([
        moneyApi.withdrawalContext(tenant.id, channelId),
        walletStore.require(),
      ]);
      if (context.withdrawalsBlocked) throw new Error("Withdrawals from this asset are paused.");

      const signature = await wallet.signMessage(
        withdrawalMessage({
          networkPassphrase: context.networkPassphrase,
          channelId,
          from: session.address,
          to,
          amount: amount!,
          requestId: context.requestId,
          expiresAt: context.expiresAt,
        }),
      );
      return moneyApi.requestWithdrawal(tenant.id, channelId, {
        amount: amount!,
        destination: to,
        requestId: context.requestId,
        expiresAt: context.expiresAt,
        signature,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenant.id] });
      toast.success("Withdrawal requested");
      setAmountText("");
    },
  });

  if (balances.data && !selected) {
    return (
      <Page title="Withdraw">
        <EmptyState title="Nothing to withdraw yet" />
      </Page>
    );
  }

  return (
    <Page title="Withdraw" subtitle="Move value out of the channel, back to Stellar">
      <div className="grid gap-6 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <Card>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                request.mutate();
              }}
            >
              {rows.length > 1 && selected && (
                <Field label="Asset">
                  <AssetSelect balances={rows} value={selected.channelId} onChange={choose} show="channel" />
                </Field>
              )}
              <Field label="Amount">
                <Input
                  big
                  name="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  trailing={
                    selected && (
                      <button
                        type="button"
                        className="hover:text-foreground"
                        onClick={() => setAmountText(formatAmount(selected.amount, selected.decimals).replace(/,/g, ""))}
                      >
                        {selected.assetCode} · max {formatAmount(selected.amount, selected.decimals)}
                      </button>
                    )
                  }
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </Field>
              <Field label="Send to">
                {destination === null ? (
                  <ReadOnlyBox
                    trailing={
                      <button type="button" className="uppercase hover:text-foreground" onClick={() => setDestination("")}>
                        Change
                      </button>
                    }
                  >
                    {shortAddress(session.address)} (your wallet)
                  </ReadOnlyBox>
                ) : (
                  <Input
                    name="destination"
                    placeholder="G… Stellar address to pay"
                    trailing={
                      <button type="button" className="uppercase hover:text-foreground" onClick={() => setDestination(null)}>
                        Me
                      </button>
                    }
                    value={destination}
                    onChange={(event) => setDestination(event.target.value.trim())}
                  />
                )}
              </Field>

              {request.isError && <ErrorState error={request.error} />}
              <Button
                type="submit"
                size="lg"
                block
                loading={request.isPending}
                disabled={!affordable || !isStellarAddress(to)}
              >
                Request withdrawal
              </Button>
            </form>
          </Card>

          <Note tone="warn" label="This is a request, not a payment">
            The operator reviews it, then pays it out on Stellar with a proof that this withdrawal has never been paid
            before. Your balance is only debited when it is approved.
          </Note>
        </div>

        <WithdrawalProgress tenantId={tenant.id} withdrawals={withdrawals.data?.items ?? []} balances={rows} />
      </div>
    </Page>
  );
}
