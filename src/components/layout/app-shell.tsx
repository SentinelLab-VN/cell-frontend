import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/cn";
import { Brand } from "./brand";
import { TenantSwitcher } from "./tenant-switcher";
import { WalletChip } from "./wallet-chip";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface AppShellProps {
  tenantId: string;
  tenantName: string;
  roleLabel: string;
  isConsole: boolean;
  nav: NavItem[];
  context?: unknown;
}

export function AppShell({ tenantId, tenantName, roleLabel, isConsole, nav, context }: AppShellProps) {
  return (
    <div className="flex h-screen">
      <aside className="flex w-[236px] shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6">
        <div className="px-2">
          <Brand />
        </div>

        <div className="mt-6">
          <TenantSwitcher tenantId={tenantId} name={tenantName} roleLabel={roleLabel} isConsole={isConsole} />
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex h-[37px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              <Icon className="size-[17px]" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <WalletChip variant="sidebar" />
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet context={context} />
      </main>
    </div>
  );
}
