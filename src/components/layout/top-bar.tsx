import type { ReactNode } from "react";
import { Brand } from "./brand";
import { NetworkPill, WalletChip } from "./wallet-chip";

/** The bar for screens outside a tenant: connect, home, and setup. */
export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <header className="border-b border-sidebar-border">
      {/* A touch wider than the screen below it, so the brand sits just left of the content column. */}
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-8 max-md:px-4">
        <Brand size="topbar" />
        {right ?? (
          <div className="flex items-center gap-2 md:gap-3">
            <NetworkPill />
            <span className="max-md:hidden">
              <WalletChip />
            </span>
            <span className="md:hidden">
              <WalletChip variant="avatar" />
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
