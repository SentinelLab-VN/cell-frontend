import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Rounded card wrapper; scrolls sideways when the columns do not fit. */
export function TableWrap({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  );
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-secondary/60", className)} {...props} />;
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("num px-5 py-3 text-[12px] font-medium tracking-[0.2em] whitespace-nowrap text-dim uppercase", className)}
      {...props}
    />
  );
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-t border-sidebar-border transition-colors first:border-t-0 hover:bg-row-hover", className)} {...props} />;
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-3.5 text-sm text-foreground", className)} {...props} />;
}
