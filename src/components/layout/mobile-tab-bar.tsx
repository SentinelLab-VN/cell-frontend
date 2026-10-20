import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import type { NavItem } from "./app-shell";

/** Bottom navigation for phones; mirrors the sidebar's items. */
export function MobileTabBar({ nav }: { nav: NavItem[] }) {
  return (
    <nav aria-label="Main" className="flex h-16 shrink-0 border-t border-sidebar-border bg-sidebar md:hidden">
      {nav.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[12px] transition-colors",
              isActive ? "font-semibold text-primary-ink" : "font-medium text-muted-foreground",
            )
          }
        >
          <Icon className="size-5" aria-hidden />
          <span className="max-w-full truncate px-0.5">{label}</span>
          {badge ? (
            <span className="num absolute top-2 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[11px] font-semibold text-primary-foreground">
              {badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
