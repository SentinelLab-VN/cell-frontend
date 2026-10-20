import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { formatAmount, gte, isPositive, parseAmount, subtract } from "@/lib/amount";
import { moneyApi } from "@/lib/api/money";
import { isStellarAddress } from "@/lib/format";
import { AssetSelect } from "./asset-select";
import { ConfirmSendDialog } from "./confirm-send-dialog";
import { SendRecentCard } from "./send-recent-card";
import { SendReviewCard } from "./send-review-card";
import { useChannelChoice } from "./use-channel-choice";

export function SendPage() {
  const tenant = useCurrentTenant();
  const session = useRequiredSession();
  const { balances, rows, selected, choose } = useChannelChoice(tenant.id);
  const [to, setTo] = useState("");
  const [amountText, setAmountText] = useState("");
  const [confirming, setConfirming] = useState(false);

  const recipients = useQuery({
    queryKey: ["tenant", tenant.id, "recipients", selected?.channelId],
    queryFn: () => moneyApi.recipients(tenant.id, selected!.channelId),
    enabled: !!selected,
  });

  if (balances.isError) return <Page title="Send"><ErrorState error={balances.error} /></Page>;
  if (balances.data && !selected) {
    return (
      <Page title="Send" subtitle="Instant, private, inside the channel">
        <EmptyState title="Nothing to send yet">Deposit first, or have someone send to your address.</EmptyState>
      </Page>
    );
  }

  const amount = selected ? parseAmount(amountText, selected.decimals) : null;
  const validTo = isStellarAddress(to) && to !== session.address;
  const affordable = !!selected && !!amount && isPositive(amount) && gte(selected.amount, amount);
  const after = selected && amount && affordable ? subtract(selected.amount, amount) : null;

  const balanceAfter = after && selected ? `${formatAmount(after, selected.decimals)} ${selected.assetCode}` : "—";

  return (
    <Page title="Send" subtitle="Instant, private, inside the channel">
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <Card>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                setConfirming(true);
              }}
            >
              {rows.length > 1 && selected && (
                <Field label="Asset">
                  <AssetSelect balances={rows} value={selected.channelId} onChange={choose} show="channel" />
                </Field>
              )}
              <Field label="To">
                <Input
                  name="to"
                  placeholder="G… Stellar address"
                  trailing={to === "" ? undefined : validTo ? "Valid" : to === session.address ? "That is you" : "Not an address"}
                  trailingTone={validTo ? "success" : "danger"}
                  value={to}
                  onChange={(event) => setTo(event.target.value.trim())}
                />
              </Field>
              <Field label="Amount">
                <Input
                  size="big"
                  name="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  trailing={selected?.assetCode}
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </Field>
              {amount && selected && !affordable && isPositive(amount) && (
                <p className="text-[15px] text-destructive">
                  You hold {formatAmount(selected.amount, selected.decimals)} {selected.assetCode} in this channel.
                </p>
              )}
              <SendReviewCard compact balanceAfter={balanceAfter} />
              <Button type="submit" size="lg" block className="mt-auto" disabled={!validTo || !affordable}>
                Sign & send
              </Button>
            </form>
          </Card>

          <SendReviewCard balanceAfter={balanceAfter} />
        </div>

        <SendRecentCard addresses={recipients.data} onPick={setTo} />
      </div>

      {selected && amount && (
        <ConfirmSendDialog
          open={confirming}
          onOpenChange={setConfirming}
          tenant={tenant}
          balance={selected}
          to={to}
          amount={amount}
          onSent={() => {
            setAmountText("");
            setTo("");
          }}
        />
      )}
    </Page>
  );
}
