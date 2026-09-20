import { ArrowUpRight, Download, List, LogOut, Wallet } from "lucide-react";
import { AppShell, type NavItem } from "@/components/layout/app-shell";
import { TenantLoader } from "@/features/tenant/tenant-layout";

const NAV: NavItem[] = [
  { to: "", label: "Balances", icon: Wallet, end: true },
  { to: "send", label: "Send", icon: ArrowUpRight },
  { to: "deposit", label: "Deposit", icon: Download },
  { to: "withdraw", label: "Withdraw", icon: LogOut },
  { to: "activity", label: "Activity", icon: List },
];

export function WalletSpaceLayout() {
  return (
    <TenantLoader>
      {(tenant) => (
        <AppShell
          tenantId={tenant.id}
          tenantName={tenant.name}
          roleLabel="Member"
          isConsole={false}
          nav={NAV}
          context={tenant}
        />
      )}
    </TenantLoader>
  );
}
