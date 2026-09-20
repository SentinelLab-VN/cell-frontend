import { FileText, Gauge, Inbox, Layers, ScrollText, Users } from "lucide-react";
import { Navigate } from "react-router-dom";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { TenantLoader } from "@/features/tenant/tenant-layout";

const NAV: NavItem[] = [
  { to: "", label: "Overview", icon: Gauge, end: true },
  { to: "channels", label: "Channels", icon: Layers },
  { to: "withdrawals", label: "Withdrawals", icon: Inbox },
  { to: "accounts", label: "Accounts", icon: Users },
  { to: "contract", label: "Contract", icon: FileText },
  { to: "audit", label: "Audit log", icon: ScrollText },
];

export function ConsoleLayout() {
  return (
    <TenantLoader>
      {(tenant) => {
        if (tenant.role === "member") return <Navigate to={`/t/${tenant.id}`} replace />;
        if (tenant.status === "provisioning") return <Navigate to={`/tenants/${tenant.id}/setup`} replace />;
        return (
          <AppShell
            tenantId={tenant.id}
            tenantName={tenant.name}
            roleLabel={tenant.role === "admin" ? "Admin" : "Operator"}
            isConsole
            nav={NAV}
            context={tenant}
          />
        );
      }}
    </TenantLoader>
  );
}
