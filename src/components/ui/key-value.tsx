import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function KeyValueList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("space-y-3", className)}>{children}</dl>;
}

export function KeyValue({ label, children, mono = true }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className={cn("min-w-0 truncate text-right text-[13px] text-foreground", mono && "num")}>{children}</dd>
    </div>
  );
}
