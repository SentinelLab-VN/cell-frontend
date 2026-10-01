import * as Menu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { useMe } from "@/features/tenant/queries";
import { cn } from "@/lib/cn";

interface TenantSwitcherProps {
  tenantId: string;
  name: string;
  roleLabel: string;
  isConsole: boolean;
  /** Borderless variant for the mobile header. */
  compact?: boolean;
}

/** One wallet can run a tenant and hold a balance in another, so the shell always offers the way across. */
export function TenantSwitcher({ tenantId, name, roleLabel, isConsole, compact = false }: TenantSwitcherProps) {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const current = me?.tenants.find((t) => t.id === tenantId);
  const canOperate = current?.role === "admin" || current?.role === "operator";

  const item = "cursor-pointer rounded-lg px-3 py-2 text-[15px] text-foreground outline-none data-[highlighted]:bg-border";
  // Members read as info-blue; anyone running the tenant reads as lime.
  const roleTone = isConsole ? "text-primary-ink" : "text-info";

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "flex w-full items-center text-left transition-colors",
          compact
            ? "min-w-0 gap-2 rounded-lg py-1"
            : "gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 hover:border-border-strong",
        )}
      >
        <Avatar name={name} size={compact ? 26 : 28} />
        <span className="min-w-0 flex-1">
          <span className={cn("block truncate font-semibold text-foreground", compact ? "text-sm leading-tight" : "text-[15px]")}>
            {name}
          </span>
          <span className={cn("block truncate text-muted-foreground", compact ? "text-[12px] leading-tight" : "text-[13px]")}>
            <span className={roleTone}>
              <span aria-hidden>● </span>
              {roleLabel}
            </span>{" "}
            · {isConsole ? "Console" : "Wallet space"}
          </span>
        </span>
        {compact ? (
          <ChevronDown className="size-3.5 shrink-0 text-dim" aria-hidden />
        ) : (
          <ChevronsUpDown className="size-3.5 shrink-0 text-dim" aria-hidden />
        )}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[204px] rounded-xl border border-border-strong bg-popover p-1 shadow-lg"
        >
          {canOperate && (
            <Menu.Item className={item} onSelect={() => navigate(isConsole ? `/t/${tenantId}` : `/t/${tenantId}/console`)}>
              {isConsole ? "View as user" : "Open operator console"}
            </Menu.Item>
          )}
          {me?.tenants
            .filter((t) => t.id !== tenantId)
            .map((t) => (
              <Menu.Item key={t.id} className={item} onSelect={() => navigate(`/t/${t.id}`)}>
                {t.name}
              </Menu.Item>
            ))}
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item className={item} onSelect={() => navigate("/home")}>
            All tenants
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
