import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { formatAmount } from "@/lib/amount";
import type { TenantSummary } from "@/lib/api/types";

const ROLE_LABEL = { admin: "Admin", operator: "Operator", member: "Member" } as const;

export function TenantRow({ tenant }: { tenant: TenantSummary }) {
  const runsIt = tenant.role === "admin" || tenant.role === "operator";

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
      <span className={`size-11 shrink-0 rounded-xl ${runsIt ? "bg-primary-subtle" : "bg-secondary"}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className="truncate text-base font-semibold text-foreground">{tenant.name}</span>
          <Pill tone={runsIt ? "accent" : "info"}>{ROLE_LABEL[tenant.role]}</Pill>
        </div>
        <p className="num mt-1 truncate text-xs text-dim">{summaryLine(tenant)}</p>
      </div>

      <TenantActions tenant={tenant} runsIt={runsIt} />
    </div>
  );
}

function TenantActions({ tenant, runsIt }: { tenant: TenantSummary; runsIt: boolean }) {
  if (tenant.status === "provisioning" && tenant.role === "admin") {
    return (
      <Link to={`/tenants/${tenant.id}/setup`}>
        <Button>Continue setup</Button>
      </Link>
    );
  }
  if (!runsIt) {
    return (
      <Link to={`/t/${tenant.id}`}>
        <Button>Open</Button>
      </Link>
    );
  }
  return (
    <div className="flex gap-2">
      <Link to={`/t/${tenant.id}`}>
        <Button variant="outline">View as user</Button>
      </Link>
      <Link to={`/t/${tenant.id}/console`}>
        <Button>Open console</Button>
      </Link>
    </div>
  );
}

function summaryLine(tenant: TenantSummary): string {
  if (tenant.status === "provisioning") return "setup not finished";
  if (tenant.status === "suspended") return "suspended";

  const balances = tenant.channels
    .filter((c) => BigInt(c.amount) > 0n)
    .map((c) => `${formatAmount(c.amount, c.decimals)} ${c.assetCode}`);
  const parts = [balances.length ? balances.join(" · ") : "no balance yet"];
  if (tenant.pendingQueue > 0) parts.push(`${tenant.pendingQueue} withdrawals waiting`);
  return parts.join("  ·  ");
}
