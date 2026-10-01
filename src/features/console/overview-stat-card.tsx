import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  /** When set the whole card is a link and shows a chevron. */
  to?: string;
}

export function OverviewStatCard({ label, value, hint, to }: StatCardProps) {
  const body = (
    <Card
      className={cn(
        "relative px-6 py-[22px]",
        to && "border-border-strong transition-colors hover:border-primary",
      )}
    >
      <p className="num text-[12px] tracking-[0.2em] text-dim uppercase">{label}</p>
      <p className="num mt-3 text-[32px] leading-none font-semibold text-foreground">{value}</p>
      {hint && <p className="num mt-2 text-xs text-dim">{hint}</p>}
      {to && <ChevronRight className="absolute top-[22px] right-6 size-3 text-primary-ink" aria-hidden />}
    </Card>
  );
  return to ? <Link to={to} className="block rounded-2xl">{body}</Link> : body;
}
