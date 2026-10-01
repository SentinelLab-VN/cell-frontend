import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/layout/page";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, ReadOnlyAction, ReadOnlyBox } from "@/components/ui/field";
import { Note } from "@/components/ui/note";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Timeline, type TimelineStep } from "@/components/ui/timeline";
import { useSubmitTx } from "@/features/chain/use-submit-tx";
import { useRequiredSession } from "@/features/session/use-session";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { isPositive, parseAmount } from "@/lib/amount";
import { moneyApi } from "@/lib/api/money";
import { tenantsApi } from "@/lib/api/tenants";
import { cn } from "@/lib/cn";
import { isStellarAddress, shortAddress } from "@/lib/format";
import { buildDeposit } from "@/lib/stellar/deposit";
import { AssetSelect } from "./asset-select";
import { useChannelChoice } from "./use-channel-choice";

export function DepositPage() {
  const tenant = useCurrentTenant();
  const session = useRequiredSession();
  // Polled: the credit arrives from the indexer, a few seconds after the chain.
  const { balances, rows, selected, choose } = useChannelChoice(tenant.id, true);
  const [amountText, setAmountText] = useState("");
  const [creditTo, setCreditTo] = useState<string | null>(null);
  const [balanceBefore, setBalanceBefore] = useState<string | null>(null);

  const amount = selected ? parseAmount(amountText, selected.decimals) : null;
  const recipient = creditTo ?? session.address;

  const deposit = useSubmitTx(async () => {
    const [context, config] = await Promise.all([
      moneyApi.depositContext(tenant.id, selected!.channelId),
      tenantsApi.config(),
    ]);
    if (context.depositsBlocked) throw new Error("Deposits into this asset are paused.");
    setBalanceBefore(selected!.amount);
    return buildDeposit({
      escrowContractId: context.escrowContractId,
      tokenContractId: context.tokenContractId,
      from: session.address,
      recipient,
      amount: amount!,
      networkPassphrase: config.networkPassphrase,
    });
  });

  const creditedToMe = recipient === session.address;
  const credited =
    deposit.isSuccess && (!creditedToMe || (balanceBefore !== null && !!selected && selected.amount !== balanceBefore));
  useEffect(() => {
    if (credited) toast.success("Deposit credited");
  }, [credited]);

  if (balances.data && !selected) {
    return (
      <Page title="Deposit">
        <EmptyState title="No assets are open here yet" />
      </Page>
    );
  }

  return (
    <Page title="Deposit" subtitle="Move assets from your wallet into the channel">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <Card>
            <form
              className={cn("flex flex-col gap-4 [&_input]:transition-opacity", deposit.isPending && "[&_input]:opacity-60")}
              onSubmit={(event) => {
                event.preventDefault();
                deposit.mutate();
              }}
            >
              {selected && (
                <Field label="Asset">
                  <AssetSelect balances={rows} value={selected.channelId} onChange={choose} show="wallet" />
                </Field>
              )}
              <Field label="Amount">
                <Input
                  size="big"
                  name="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  trailing={selected?.assetCode}
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                  disabled={deposit.isPending}
                />
              </Field>
              <Field label="Credit to">
                {creditTo === null ? (
                  <ReadOnlyBox
                    trailing={
                      <ReadOnlyAction onClick={() => setCreditTo("")}>Change</ReadOnlyAction>
                    }
                  >
                    My account · {shortAddress(session.address)}
                  </ReadOnlyBox>
                ) : (
                  <Input
                    name="credit-to"
                    placeholder="G… address to credit instead of yours"
                    trailing={
                      <button type="button" className="uppercase hover:text-foreground" onClick={() => setCreditTo(null)}>
                        Me
                      </button>
                    }
                    value={creditTo}
                    onChange={(event) => setCreditTo(event.target.value.trim())}
                  />
                )}
              </Field>

              {deposit.isError && <ErrorState error={deposit.error} />}
              <Button
                type="submit"
                size="lg"
                block
                className="mt-auto"
                loading={deposit.isPending}
                disabled={!amount || !isPositive(amount) || !isStellarAddress(recipient)}
              >
                {deposit.isPending ? "Waiting for the network…" : "Sign deposit in wallet"}
              </Button>
            </form>
          </Card>

          <Note label="What you sign">
            One Stellar transaction calling deposit() on the escrow. The network fee is yours; Cell takes none. Your
            balance appears once the indexer sees the event — usually one ledger, about 5 seconds.
          </Note>
        </div>

        <div className="space-y-4">
          <Card>
            <CardTitle>After you sign</CardTitle>
            <div className="mt-5">
              <Timeline steps={depositSteps(deposit.isPending, deposit.isSuccess, credited)} />
            </div>
          </Card>
          <Note tone="warn" label="Fee-taking assets">
            If an asset deducts a fee on transfer, the escrow credits what actually arrived — not what you typed. The
            amount shown after confirmation is the real one.
          </Note>
        </div>
      </div>
    </Page>
  );
}

function depositSteps(submitting: boolean, onChain: boolean, credited: boolean): TimelineStep[] {
  return [
    { title: "Transaction submitted", detail: "Stellar network", state: onChain ? "done" : submitting ? "current" : "upcoming" },
    { title: "Escrow measures what arrived", detail: "deposit event emitted", state: onChain ? "done" : "upcoming" },
    {
      title: "Indexer credits your channel",
      detail: "balance is spendable",
      state: credited ? "done" : onChain ? "current" : "upcoming",
    },
    { title: "Ready to send", detail: "instant, no fee", state: credited ? "done" : "upcoming" },
  ];
}
