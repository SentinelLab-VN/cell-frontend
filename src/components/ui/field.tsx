import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-xs leading-relaxed text-dim">{hint}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Right-aligned caption inside the box: a unit, "VALID", "MAX". */
  trailing?: ReactNode;
  big?: boolean;
}

export function Input({ trailing, big = false, className, ...props }: InputProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-3 rounded-[10px] border border-border bg-background px-3.5",
        "focus-within:border-border-strong focus-within:ring-2 focus-within:ring-ring/30",
        big ? "h-[62px]" : "h-[46px]",
      )}
    >
      <input
        className={cn(
          "num min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-dim",
          big ? "text-[26px]" : "text-sm",
          className,
        )}
        autoComplete="off"
        spellCheck={false}
        {...props}
      />
      {trailing && <span className="shrink-0 text-xs text-dim uppercase">{trailing}</span>}
    </span>
  );
}

/** A value shown in an input-shaped box that is not editable here. */
export function ReadOnlyBox({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <span className="flex h-[46px] items-center gap-3 rounded-[10px] border border-border bg-background px-3.5">
      <span className="num min-w-0 flex-1 truncate text-sm text-foreground">{children}</span>
      {trailing && <span className="shrink-0 text-xs text-dim uppercase">{trailing}</span>}
    </span>
  );
}
