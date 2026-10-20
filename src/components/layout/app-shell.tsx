import type { LucideIcon } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/cn";
import { AppShellMobileHeader } from "./app-shell-mobile-header";
import { Brand } from "./brand";
import { MobileTabBar } from "./mobile-tab-bar";
import { TenantSwitcher } from "./tenant-switcher";
import { WalletChip } from "./wallet-chip";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Count shown as a warning pill, e.g. withdrawals waiting for review. Hidden when 0 or absent. */
  badge?: number;
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
    <div className="flex h-dvh max-md:flex-col">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 pt-5 pb-4 md:flex">
        <div className="px-2">
          <Brand size="sidebar" />
        </div>

        <div className="mt-5">
          <TenantSwitcher tenantId={tenantId} name={tenantName} roleLabel={roleLabel} isConsole={isConsole} />
        </div>

        <nav className="mt-5 flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex h-9 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground shadow-[inset_2px_0_0_var(--primary)]"
                    : "text-muted-foreground hover:bg-row-hover hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="num flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-warning-subtle-border bg-warning-subtle px-1.5 text-[12px] font-semibold text-warning">
                  {badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <WalletChip variant="sidebar" />
        </div>
      </aside>

      <AppShellMobileHeader tenantId={tenantId} tenantName={tenantName} roleLabel={roleLabel} isConsole={isConsole} />

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet context={context} />
      </main>

      <MobileTabBar nav={nav} />
    </div>
  );
}
