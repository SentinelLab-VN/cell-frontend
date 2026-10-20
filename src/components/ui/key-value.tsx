import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function KeyValueList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("divide-y divide-sidebar-border", className)}>{children}</dl>;
}

export function KeyValue({ label, children, mono = true }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-[15px] text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 text-right text-[15px] text-foreground [overflow-wrap:anywhere]", mono && "num")}>{children}</dd>
    </div>
  );
}
