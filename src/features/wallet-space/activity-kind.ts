import { ArrowDownLeft, ArrowUpRight, Download, LogOut, RotateCcw, type LucideIcon } from "lucide-react";
import type { ActivityRow } from "@/lib/api/types";

export type Filter = "all" | "transfers" | "deposits" | "withdrawals";

export interface Kind {
  label: string;
  icon: LucideIcon;
  group: Exclude<Filter, "all">;
}

/** Maps a ledger row to the label, icon and filter group shown for it. */
export function kindOf(row: ActivityRow): Kind {
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
