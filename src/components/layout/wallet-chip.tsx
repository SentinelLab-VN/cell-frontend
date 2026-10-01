import * as Menu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { signOut } from "@/features/session/sign-in";
import { useSession } from "@/features/session/use-session";
import { cn } from "@/lib/cn";
import { shortAddress } from "@/lib/format";

/** "● Testnet": the network the app talks to. Warning-tinted because nothing here is real money yet. */
export function NetworkPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-warning-subtle-border bg-warning-subtle px-3.5 text-sm font-medium text-warning",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-warning" aria-hidden />
      Testnet
    </span>
  );
}

function useDisconnect() {
  const navigate = useNavigate();
  return () => {
    signOut();
    navigate("/");
  };
}

/**
 * The connected address.
 * - sidebar: card with a direct Disconnect button
 * - inline: top-bar button that opens a menu with Disconnect
 * - avatar: bare 30px avatar (mobile header) that opens the same menu
 */
export function WalletChip({ variant = "inline" }: { variant?: "inline" | "sidebar" | "avatar" }) {
  const session = useSession();
  const disconnect = useDisconnect();
  if (!session) return null;

  if (variant === "sidebar") {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-border py-2.5 pr-2 pl-2.5">
        <Avatar address={session.address} size={26} />
        <span className="min-w-0 flex-1">
          <span className="num block truncate text-xs text-foreground">{shortAddress(session.address)}</span>
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-warning" aria-hidden />
            Testnet
          </span>
        </span>
        <button
          type="button"
          aria-label="Disconnect"
          title="Disconnect"
          onClick={disconnect}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={variant === "avatar" ? "Wallet menu" : undefined}
        className={cn(
          "flex items-center text-left transition-colors",
          variant === "avatar"
            ? "rounded-full"
            : "h-9 gap-2 rounded-[10px] border border-border pr-2.5 pl-2 hover:bg-secondary",
        )}
      >
        <Avatar address={session.address} size={variant === "avatar" ? 30 : 24} />
        {variant === "inline" && (
          <>
            <span className="num text-xs whitespace-nowrap text-foreground">{shortAddress(session.address)}</span>
            <ChevronDown className="size-3.5 text-dim" aria-hidden />
          </>
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-xl border border-border-strong bg-popover p-1 shadow-lg"
        >
          <Menu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[15px] text-foreground outline-none data-[highlighted]:bg-border"
            onSelect={disconnect}
          >
            <LogOut className="size-4 text-muted-foreground" aria-hidden />
            Disconnect
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
