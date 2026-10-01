import { FileText, Gauge, Inbox, Layers, ScrollText, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { TenantLoader } from "@/features/tenant/tenant-layout";
import type { Tenant } from "@/lib/api/types";
import { useOverview } from "./queries";

const NAV: NavItem[] = [
  { to: "", label: "Overview", icon: Gauge, end: true },
  { to: "channels", label: "Channels", icon: Layers },
  { to: "withdrawals", label: "Withdrawals", icon: Inbox },
  { to: "accounts", label: "Accounts", icon: Users },
  { to: "contract", label: "Contract", icon: FileText },
  { to: "audit", label: "Audit log", icon: ScrollText },
];

/** Shares the overview query with the Overview page and never polls on its own: one fetch per visit, then whatever the page refreshes. */
function ConsoleShell({ tenant }: { tenant: Tenant }) {
  const waiting = useOverview(tenant.id, { poll: false }).data?.queue.requested ?? 0;
  const nav = NAV.map((item) => (item.to === "withdrawals" ? { ...item, badge: waiting } : item));
  return (
    <AppShell
      tenantId={tenant.id}
      tenantName={tenant.name}
      roleLabel={tenant.role === "admin" ? "Admin" : "Operator"}
      isConsole
      nav={nav}
      context={tenant}
    />
  );
}

export function ConsoleLayout() {
  return (
    <TenantLoader>
      {(tenant) => {
        if (tenant.role === "member") return <Navigate to={`/t/${tenant.id}`} replace />;
        if (tenant.status === "provisioning") return <Navigate to={`/tenants/${tenant.id}/setup`} replace />;
        return <ConsoleShell tenant={tenant} />;
      }}
    </TenantLoader>
  );
}
