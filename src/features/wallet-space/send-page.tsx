import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useRequiredSession } from "@/features/session/use-session";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { formatAmount, gte, isPositive, parseAmount, subtract } from "@/lib/amount";
import { moneyApi } from "@/lib/api/money";
import { isStellarAddress, shortAddress } from "@/lib/format";
import { AssetSelect } from "./asset-select";
import { ConfirmSendDialog } from "./confirm-send-dialog";
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

  return (
    <Page title="Send" subtitle="Instant, private, inside the channel">
      <div className="grid gap-6 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <Card>
            <form
              className="space-y-4"
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
                  value={to}
                  onChange={(event) => setTo(event.target.value.trim())}
                />
              </Field>
              <Field label="Amount">
                <Input
                  big
                  name="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  trailing={selected?.assetCode}
                  value={amountText}
                  onChange={(event) => setAmountText(event.target.value)}
                />
              </Field>
              {amount && selected && !affordable && isPositive(amount) && (
                <p className="text-[13px] text-destructive">
                  You hold {formatAmount(selected.amount, selected.decimals)} {selected.assetCode} in this channel.
                </p>
              )}
              <Button type="submit" size="lg" block disabled={!validTo || !affordable}>
                Sign & send
              </Button>
            </form>
          </Card>

          <Card>
            <CardTitle>Review</CardTitle>
            <KeyValueList className="mt-4">
              <KeyValue label="Arrives" mono={false}>
                <span className="text-success">Instantly</span>
              </KeyValue>
              <KeyValue label="Network fee" mono={false}>
                None — nothing touches mainnet
              </KeyValue>
              <KeyValue label="Visible on-chain" mono={false}>
                No
              </KeyValue>
              <KeyValue label="Your balance after">
                {after && selected ? `${formatAmount(after, selected.decimals)} ${selected.assetCode}` : "—"}
              </KeyValue>
            </KeyValueList>
          </Card>
        </div>

        <Card className="self-start">
          <CardTitle>Recent</CardTitle>
          <ul className="mt-4 space-y-1">
            {recipients.data?.length === 0 && <li className="text-[13px] text-dim">Nobody yet.</li>}
            {recipients.data?.map((address) => (
              <li key={address}>
                <button
                  type="button"
                  onClick={() => setTo(address)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary"
                >
                  <span className="size-6 rounded-full bg-secondary" aria-hidden />
                  <span className="num text-[13px] text-foreground">{shortAddress(address)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
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
