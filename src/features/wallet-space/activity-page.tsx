import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Download, LogOut, RotateCcw, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Page } from "@/components/layout/page";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { AmountText } from "@/components/ui/text";
import { CHAIN_POLL_MS, keys, useBalances } from "@/features/tenant/queries";
import { useCurrentTenant } from "@/features/tenant/tenant-context";
import { moneyApi } from "@/lib/api/money";
import type { ActivityRow } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { clockTime } from "@/lib/format";

type Filter = "all" | "transfers" | "deposits" | "withdrawals";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "transfers", label: "Transfers" },
  { id: "deposits", label: "Deposits" },
  { id: "withdrawals", label: "Withdrawals" },
];

interface Kind {
  label: string;
  icon: LucideIcon;
  group: Exclude<Filter, "all">;
}

function kindOf(row: ActivityRow): Kind {
  const incoming = !row.amount.startsWith("-");
  switch (row.reason) {
    case "deposit":
      return { label: "Deposit", icon: Download, group: "deposits" };
    case "transfer":
      return incoming
        ? { label: "Received", icon: ArrowDownLeft, group: "transfers" }
        : { label: "Sent", icon: ArrowUpRight, group: "transfers" };
    case "withdrawal_refund":
      return { label: "Withdrawal refunded", icon: RotateCcw, group: "withdrawals" };
    default:
      return { label: "Withdrawal", icon: LogOut, group: "withdrawals" };
  }
}

export function ActivityPage() {
  const tenant = useCurrentTenant();
  const [filter, setFilter] = useState<Filter>("all");
  const { data: balances } = useBalances(tenant.id);
  const activity = useQuery({
    queryKey: keys.activity(tenant.id),
    queryFn: () => moneyApi.activity(tenant.id),
    refetchInterval: CHAIN_POLL_MS,
  });

  const rows = (activity.data?.items ?? []).filter((row) => filter === "all" || kindOf(row).group === filter);

  return (
    <Page title="Activity" subtitle="Everything that moved, and where it is now">
      <div role="tablist" className="mb-4 inline-flex gap-1 rounded-xl border border-border bg-card p-1">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              "h-8 rounded-lg px-4 text-[13px] font-medium transition-colors",
              filter === id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activity.isPending && <Skeleton className="h-48" />}
      {activity.isError && <ErrorState error={activity.error} />}
      {activity.data && rows.length === 0 && <EmptyState title="Nothing has moved yet" />}

      {rows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-left">
            <thead className="bg-secondary/60">
              <tr className="num text-[10px] tracking-[0.2em] text-dim uppercase">
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const kind = kindOf(row);
                const asset = balances?.find((b) => b.channelId === row.channelId);
                return (
                  <tr key={row.seq} className="border-t border-border">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <kind.icon className="size-4 text-muted-foreground" aria-hidden />
                        {kind.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm">
                      <AmountText units={row.amount} decimals={asset?.decimals ?? 7} code={asset?.assetCode} signed />
                    </td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-muted-foreground">{clockTime(row.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
