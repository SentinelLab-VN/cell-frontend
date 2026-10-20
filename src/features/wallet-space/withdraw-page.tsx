import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
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

  // The server picks the request id and the expiry; both are signed. Read up
  // front so the form can show the real ceiling: what is spendable net of
  // other pending requests, and the asset's per-withdrawal cap.
  const context = useQuery({
    queryKey: ["tenant", tenant.id, "withdrawal-context", selected?.channelId],
    queryFn: () => moneyApi.withdrawalContext(tenant.id, selected!.channelId),
    enabled: !!selected,
    staleTime: 0,
  });
  const spendable = context.data?.spendable ?? selected?.amount ?? "0";
  const cap = context.data?.releaseCap ?? null;

  const amount = selected ? parseAmount(amountText, selected.decimals) : null;
  const to = destination ?? session.address;
  const withinCap = !amount || cap === null || gte(cap, amount);
  const affordable = !!selected && !!amount && isPositive(amount) && gte(spendable, amount) && withinCap;

  // A signed request outlives a lost response. Resubmitting the same signature
  // and request id replays rather than queues a second payout; a fresh context
  // would do the opposite.
  const signed = useRef<{ channelId: string; to: string; amount: string; body: Parameters<typeof moneyApi.requestWithdrawal>[2] } | null>(null);

  const request = useMutation({
    mutationFn: async () => {
      const channelId = selected!.channelId;
      const previous = signed.current;
      const reusable =
        previous &&
        previous.channelId === channelId &&
        previous.to === to &&
        previous.amount === amount &&
        new Date(previous.body.expiresAt).getTime() > Date.now();
      if (reusable) return moneyApi.requestWithdrawal(tenant.id, channelId, previous.body);
      signed.current = null;

      const ctx = context.data ?? (await moneyApi.withdrawalContext(tenant.id, channelId));
      if (ctx.withdrawalsBlocked) throw new Error("Withdrawals from this asset are paused.");
      const wallet = await walletStore.require();
      const signature = await wallet.signMessage(
        withdrawalMessage({
          networkPassphrase: ctx.networkPassphrase,
          channelId,
          from: session.address,
          to,
          amount: amount!,
          requestId: ctx.requestId,
          expiresAt: ctx.expiresAt,
        }),
      );
      const body = { amount: amount!, destination: to, requestId: ctx.requestId, expiresAt: ctx.expiresAt, signature };
      signed.current = { channelId, to, amount: amount!, body };
      return moneyApi.requestWithdrawal(tenant.id, channelId, body);
    },
    onSuccess: () => {
      signed.current = null;
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
              <Field
                label="Amount"
                hint={
                  selected &&
                  (cap === null
                    ? "No per-withdrawal cap on this asset."
                    : `At most ${formatAmount(cap, selected.decimals)} ${selected.assetCode} per withdrawal.`)
                }
              >
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
                        onClick={() => setAmountText(formatAmount(spendable, selected.decimals).replace(/,/g, ""))}
                      >
                        {selected.assetCode} · max {formatAmount(spendable, selected.decimals)}
                      </button>
                    )
                  }
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </Field>
              {context.data?.withdrawalsBlocked && (
                <Note tone="danger" label="Withdrawals from this asset are paused">
                  The operator has closed the gate on chain. Your balance is untouched; try again once it reopens.
                </Note>
              )}
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
                disabled={!affordable || !isStellarAddress(to) || !!context.data?.withdrawalsBlocked}
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
