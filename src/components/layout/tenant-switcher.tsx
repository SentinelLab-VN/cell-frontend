import * as Menu from "@radix-ui/react-dropdown-menu";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMe } from "@/features/tenant/queries";
import { cn } from "@/lib/cn";

interface TenantSwitcherProps {
  tenantId: string;
  name: string;
  roleLabel: string;
  isConsole: boolean;
}

/** One wallet can run a tenant and hold a balance in another, so the shell always offers the way across. */
export function TenantSwitcher({ tenantId, name, roleLabel, isConsole }: TenantSwitcherProps) {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const current = me?.tenants.find((t) => t.id === tenantId);
  const canOperate = current?.role === "admin" || current?.role === "operator";

  const item = "cursor-pointer rounded-lg px-3 py-2 text-[13px] text-foreground outline-none data-[highlighted]:bg-secondary";

  return (
    <Menu.Root>
      <Menu.Trigger className="flex w-full items-center gap-3 rounded-[10px] border border-border bg-secondary/60 px-3 py-2.5 text-left transition-colors hover:bg-secondary">
        <span className="size-6 shrink-0 rounded-md bg-primary-subtle" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-foreground">{name}</span>
          <span className={cn("block text-[11px]", isConsole ? "text-primary" : "text-dim")}>{roleLabel}</span>
        </span>
        <ChevronsUpDown className="size-3.5 text-dim" aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[204px] rounded-xl border border-border-strong bg-popover p-1 shadow-xl"
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
