import { TenantSwitcher } from "./tenant-switcher";
import { WalletChip } from "./wallet-chip";

interface MobileHeaderProps {
  tenantId: string;
  tenantName: string;
  roleLabel: string;
  isConsole: boolean;
}

/** 56px header shown below the md breakpoint, in place of the sidebar. */
export function AppShellMobileHeader(props: MobileHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 md:hidden">
      <div className="min-w-0 flex-1">
        <TenantSwitcher tenantId={props.tenantId} name={props.tenantName} roleLabel={props.roleLabel} isConsole={props.isConsole} compact />
      </div>
      <WalletChip variant="avatar" />
    </header>
  );
}
