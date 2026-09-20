import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Pill, type Tone } from "@/components/ui/pill";
import { Timeline, type TimelineStep } from "@/components/ui/timeline";
import { AmountText } from "@/components/ui/text";
import { moneyApi } from "@/lib/api/money";
import type { BalanceRow, Withdrawal, WithdrawalStatus } from "@/lib/api/types";
import { clockTime, shortHash } from "@/lib/format";
import { explorerTx } from "@/lib/stellar/network";

const STATUS: Record<WithdrawalStatus, { label: string; tone: Tone }> = {
  requested: { label: "Waiting for review", tone: "warn" },
  approved: { label: "Approved", tone: "info" },
  releasing: { label: "Settling", tone: "info" },
  released: { label: "Paid out", tone: "ok" },
  failed: { label: "Failed — refunded", tone: "danger" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

interface Props {
  tenantId: string;
  withdrawals: Withdrawal[];
  balances: BalanceRow[];
}

/** The most recent withdrawal, step by step. */
export function WithdrawalProgress({ tenantId, withdrawals, balances }: Props) {
  const queryClient = useQueryClient();
  const latest = withdrawals[0];

  const cancel = useMutation({
    mutationFn: (id: string) => moneyApi.cancelWithdrawal(tenantId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tenant", tenantId] }),
  });

  if (!latest) {
    return (
      <Card className="self-start">
        <CardTitle>In progress</CardTitle>
        <p className="mt-3 text-[13px] text-dim">No withdrawals yet.</p>
      </Card>
    );
  }

  const asset = balances.find((b) => b.channelId === latest.channelId);
  const status = STATUS[latest.status];

  return (
    <Card className="self-start">
      <CardTitle>{latest.status === "released" ? "Latest withdrawal" : "In progress"}</CardTitle>
      <div className="mt-3 mb-5 flex items-center justify-between">
        <AmountText units={latest.amount} decimals={asset?.decimals ?? 7} code={asset?.assetCode} className="text-lg text-foreground" />
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>

      <Timeline steps={progressSteps(latest)} />

      {latest.releaseTxHash && (
        <a
          className="num mt-4 block text-xs text-info hover:underline"
          href={explorerTx(latest.releaseTxHash)}
          target="_blank"
          rel="noreferrer"
        >
          tx {shortHash(latest.releaseTxHash)} ↗
        </a>
      )}
      {latest.status === "requested" && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          loading={cancel.isPending}
          onClick={() => cancel.mutate(latest.id)}
        >
          Cancel request
        </Button>
      )}
    </Card>
  );
}

function progressSteps(w: Withdrawal): TimelineStep[] {
  if (w.status === "cancelled" || w.status === "rejected" || w.status === "failed") {
    return [
      { title: "Requested", detail: clockTime(w.requestedAt), state: "done" },
      { title: STATUS[w.status].label, detail: w.decisionNote ?? w.failureReason ?? undefined, state: "current" },
    ];
  }
  const approved = w.status !== "requested";
  const submitted = w.status === "releasing" || w.status === "released";
  const released = w.status === "released";
  return [
    { title: "Requested", detail: clockTime(w.requestedAt), state: "done" },
    {
      title: "Approved by operator",
      detail: w.decidedAt ? clockTime(w.decidedAt) : "your balance is debited here",
      state: approved ? "done" : "current",
    },
    {
      title: "Paid out on Stellar",
      detail: w.nonce != null ? `nonce ${w.nonce} · proof submitted` : "queued for release",
      state: released ? "done" : submitted || approved ? "current" : "upcoming",
    },
    { title: "Confirmed", detail: w.releasedAt ? clockTime(w.releasedAt) : "tx hash appears here", state: released ? "done" : "upcoming" },
  ];
}
