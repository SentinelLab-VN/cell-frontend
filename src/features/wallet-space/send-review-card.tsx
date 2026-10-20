import { Zap } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { KeyValue, KeyValueList } from "@/components/ui/key-value";
import { cn } from "@/lib/cn";

/** Terms of the transfer. A titled card beside the form on wide screens, a compact box under the fields on phones. */
export function SendReviewCard({ balanceAfter, compact = false }: { balanceAfter: string; compact?: boolean }) {
  const rows = (
    <KeyValueList className={cn(!compact && "mt-4")}>
      <KeyValue label="Arrives" mono={false}>
        <span className="inline-flex items-center gap-1 text-success">
          <Zap className="size-[13px]" aria-hidden />
          Instantly
        </span>
      </KeyValue>
      <KeyValue label="Network fee" mono={false}>
        None — nothing touches mainnet
      </KeyValue>
      <KeyValue label="Visible on-chain" mono={false}>
        No
      </KeyValue>
      <KeyValue label="Your balance after">{balanceAfter}</KeyValue>
    </KeyValueList>
  );

  if (compact) return <div className="rounded-xl border border-border bg-card px-4 py-1 md:hidden">{rows}</div>;
  return (
    <Card className="max-md:hidden">
      <CardTitle>Review</CardTitle>
      {rows}
    </Card>
  );
}
