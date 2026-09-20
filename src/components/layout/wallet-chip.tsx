import * as Menu from "@radix-ui/react-dropdown-menu";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/features/session/sign-in";
import { useSession } from "@/features/session/use-session";
import { cn } from "@/lib/cn";
import { shortAddress } from "@/lib/format";

/** The connected address. Opens the only account action there is: signing out. */
export function WalletChip({ variant = "inline" }: { variant?: "inline" | "sidebar" }) {
  const session = useSession();
  const navigate = useNavigate();
  if (!session) return null;

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "flex items-center gap-2.5 rounded-[10px] border border-border text-left transition-colors hover:bg-secondary",
          variant === "sidebar" ? "w-full px-3 py-2.5" : "h-8 px-3",
        )}
      >
        <span className="size-[18px] shrink-0 rounded-full bg-border-strong" aria-hidden />
        <span className="min-w-0">
          <span className="num block truncate text-xs text-foreground">{shortAddress(session.address)}</span>
          {variant === "sidebar" && <span className="block text-[11px] text-dim">Testnet</span>}
        </span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-44 rounded-xl border border-border-strong bg-popover p-1 shadow-xl"
        >
          <Menu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-foreground outline-none data-[highlighted]:bg-secondary"
            onSelect={() => {
              signOut();
              navigate("/");
            }}
          >
            <LogOut className="size-4 text-muted-foreground" />
            Disconnect
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
