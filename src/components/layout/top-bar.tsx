import type { ReactNode } from "react";
import { Brand } from "./brand";
import { WalletChip } from "./wallet-chip";

/** The bar for screens outside a tenant: connect, home, and setup. */
export function TopBar({ right }: { right?: ReactNode }) {
  return (
    <header className="flex h-[62px] items-center justify-between border-b border-border px-8">
      <Brand />
      {right ?? <WalletChip />}
    </header>
  );
}
