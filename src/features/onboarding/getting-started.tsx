import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/features/session/use-session";
import { CHAIN_POLL_MS, keys, useBalances } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { moneyApi } from "@/lib/api/money";
import { cn } from "@/lib/cn";
import { FaucetButton } from "./faucet";
import { useIsTestnet } from "./helpers";

interface Step {
  title: string;
  body: string;
  done: boolean;
  action: ReactNode;
}

/**
 * The four things a newcomer has to do, in order, with the one they are on
 * highlighted and the ones they have finished ticked off.
 *
 * Each step reads its own state from the data, so it ticks itself a few
 * seconds after the money moves rather than when a button was pressed. The
 * card disappears for good once all four are done.
 */
export function GettingStarted() {
  const tenant = useCurrentTenant();
  const session = useSession();
  const testnet = useIsTestnet();
  const storageKey = `cell:guide-dismissed:${tenant.id}`;
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  const balances = useBalances(tenant.id, true);
  const activity = useQuery({
    queryKey: keys.activity(tenant.id),
    queryFn: () => moneyApi.activity(tenant.id),
    refetchInterval: CHAIN_POLL_MS,
  });

  const rows = activity.data?.items ?? [];
  const inChannel = (balances.data ?? []).some((b) => BigInt(b.amount) > 0n);
  const funded = (balances.data ?? []).some((b) => BigInt(b.walletBalance ?? "0") > 0n);
  const deposited = inChannel || rows.some((r) => r.reason === "deposit");
  const sent = rows.some((r) => r.reason === "transfer");
  const withdrawn = rows.some((r) => r.reason.startsWith("withdrawal"));

  const steps: Step[] = [
    {
      title: "Fund your Stellar wallet",
      body: "Every deposit and withdrawal is a Stellar transaction your wallet pays the fee for.",
      done: funded,
      action: session ? <FaucetButton address={session.address} size="sm" /> : null,
    },
    {
      title: "Deposit into the channel",
      body: "Your wallet signs one transaction. The escrow holds the asset and credits you here.",
      done: deposited,
      action: <StepLink to="deposit">Deposit</StepLink>,
    },
    {
      title: "Send inside the channel",
      body: "Transfers between members settle instantly, cost nothing, and never touch the chain.",
      done: sent,
      action: <StepLink to="send">Send</StepLink>,
    },
    {
      title: "Withdraw back to your wallet",
      body: "You request it, the operator approves, and the escrow pays your wallet on chain.",
      done: withdrawn,
      action: <StepLink to="withdraw">Withdraw</StepLink>,
    },
  ];

  const finished = steps.filter((s) => s.done).length;
  if (dismissed || finished === steps.length || !testnet) return null;

  const current = steps.findIndex((s) => !s.done);
  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // A browser that refuses storage just sees the card again next time.
    }
    setDismissed(true);
  };

  return (
    <Card className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Getting started</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Four steps, in order. They tick themselves as the money moves.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide this guide"
          className="rounded-lg p-1.5 text-dim transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${(finished / steps.length) * 100}%` }}
        />
      </div>
      <p className="num mt-2 text-[11px] text-dim">
        {finished} of {steps.length} done
      </p>

      <ol className="mt-5 space-y-2.5">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border px-4 py-3.5 transition-colors",
              index === current
                ? "border-primary/50 bg-primary-subtle/40"
                : "border-border bg-background",
              step.done && "opacity-70",
            )}
          >
            <span
              className={cn(
                "num flex size-7 shrink-0 items-center justify-center rounded-full text-[12px]",
                step.done
                  ? "bg-primary text-primary-foreground"
                  : index === current
                    ? "bg-primary/20 text-primary ring-2 ring-primary/40 motion-safe:animate-pulse"
                    : "bg-secondary text-dim",
              )}
            >
              {step.done ? <Check className="size-4 animate-in zoom-in duration-300" aria-hidden /> : index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", step.done ? "text-muted-foreground line-through" : "text-foreground")}>
                {step.title}
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
            {!step.done && index === current && <div className="ml-auto">{step.action}</div>}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function StepLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={`/t/${useCurrentTenant().id}/${to}`}>
      <Button size="sm">
        {children}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </Link>
  );
}
