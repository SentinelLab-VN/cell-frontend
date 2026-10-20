import { ArrowRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pill, type Tone } from "@/components/ui/pill";
import { formatAmount } from "@/lib/amount";
import type { TenantSummary } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const ROLE_LABEL = { admin: "Admin", operator: "Operator", member: "Member" } as const;
const ROLE_TONE: Record<TenantSummary["role"], Tone> = { admin: "accent", operator: "neutral", member: "info" };

export function TenantRow({ tenant }: { tenant: TenantSummary }) {
  const runsIt = tenant.role === "admin" || tenant.role === "operator";

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-[18px] transition-colors hover:border-border-strong max-md:flex-wrap",
        tenant.status === "suspended" && "opacity-70",
      )}
    >
      <Avatar name={tenant.name} size={44} />

      <div className="min-w-0 flex-1 max-md:basis-[calc(100%-60px)]">
        <div className="flex items-center gap-2.5">
          <span className="truncate text-base font-semibold text-foreground">{tenant.name}</span>
          <Pill tone={ROLE_TONE[tenant.role]}>{ROLE_LABEL[tenant.role]}</Pill>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px] text-muted-foreground">{summaryParts(tenant)}</p>
      </div>

      <TenantActions tenant={tenant} runsIt={runsIt} />
    </div>
  );
}

function TenantActions({ tenant, runsIt }: { tenant: TenantSummary; runsIt: boolean }) {
  // On phones the buttons drop under the row as a two-column grid of tall targets.
  const grid =
    "max-md:grid max-md:w-full max-md:grid-cols-2 max-md:[&_a]:block max-md:[&_a:only-child]:col-span-2 max-md:[&_button]:h-11 max-md:[&_button]:w-full";

  if (tenant.status === "provisioning" && tenant.role === "admin") {
    return (
      <div className={grid}>
        <Link to={`/tenants/${tenant.id}/setup`}>
          <Button>
            Continue setup
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </Link>
      </div>
    );
  }
  if (!runsIt) {
    return (
      <div className={grid}>
        <Link to={`/t/${tenant.id}`}>
          <Button>Open</Button>
        </Link>
      </div>
    );
  }
  return (
    <div className={cn("flex gap-2", grid)}>
      <Link to={`/t/${tenant.id}`}>
        <Button variant="outline">View as user</Button>
      </Link>
      <Link to={`/t/${tenant.id}/console`}>
        <Button>Open console</Button>
      </Link>
    </div>
  );
}

function Flag({ tone, children }: { tone: "warning" | "destructive"; children: ReactNode }) {
  const color = tone === "warning" ? "text-warning" : "text-destructive";
  return (
    <span className={cn("inline-flex items-center gap-1.5", color)}>
      <span className="size-[5px] rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

function summaryParts(tenant: TenantSummary): ReactNode {
  if (tenant.status === "provisioning") return <Flag tone="warning">setup not finished</Flag>;
  if (tenant.status === "suspended") return <Flag tone="destructive">suspended</Flag>;

  const balances = tenant.channels
    .filter((c) => BigInt(c.amount) > 0n)
    .map((c) => (
      <span key={c.assetCode} className="num text-foreground">{`${formatAmount(c.amount, c.decimals)} ${c.assetCode}`}</span>
    ));
  const parts: ReactNode[] = balances.length ? balances : ["no balance yet"];
  if (tenant.pendingQueue > 0) parts.push(<Flag tone="warning">{`${tenant.pendingQueue} withdrawals waiting`}</Flag>);

  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 && (
        <span className="text-border-strong" aria-hidden>
          ·
        </span>
      )}
      {part}
    </Fragment>
  ));
}
