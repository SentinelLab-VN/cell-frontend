import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-normal text-dim">{hint}</span>}
    </label>
  );
}

export type TrailingTone = "success" | "danger" | "muted";

const trailingTones: Record<TrailingTone, string> = {
  success: "text-success",
  danger: "text-destructive",
  muted: "text-muted-foreground",
};

/** Caption or button at the right edge of an input box. Big inputs use a larger, un-capitalised caption. */
function Trailing({ big, tone = "muted", children }: { big: boolean; tone?: TrailingTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "num shrink-0",
        big ? "text-[15px]" : "text-[13px] tracking-[0.06em] uppercase",
        trailingTones[tone],
        // Buttons placed in the slot pick up the same caption style and a hover lift.
        "[&_button]:cursor-pointer [&_button]:transition-colors [&_button:hover]:text-foreground",
      )}
    >
      {children}
    </span>
  );
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Right-aligned caption or button inside the box: a unit, "VALID", "MAX". */
  trailing?: ReactNode;
  trailingTone?: TrailingTone;
  /** "big" is the 60px amount input. `big` (boolean) is kept for existing callers. */
  size?: "default" | "big";
  big?: boolean;
}

export function Input({ trailing, trailingTone, size = "default", big, className, ...props }: InputProps) {
  const isBig = big ?? size === "big";
  return (
    <span
      className={cn(
        "flex items-center gap-3 rounded-[10px] border border-input bg-background",
        "focus-within:border-primary",
        isBig ? "h-[60px] px-4" : "h-11 px-3.5",
      )}
    >
      <input
        className={cn(
          "num min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-dim",
          isBig ? "text-[30px] font-semibold tracking-[-0.01em]" : "text-sm",
          className,
        )}
        autoComplete="off"
        spellCheck={false}
        {...props}
      />
      {trailing && (
        <Trailing big={isBig} tone={trailingTone}>
          {trailing}
        </Trailing>
      )}
    </span>
  );
}

/** A value shown in an input-shaped box that is not editable here. */
export function ReadOnlyBox({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <span className="flex h-11 items-center gap-3 rounded-[10px] border border-dashed border-border-strong bg-transparent px-3.5">
      <span className="num min-w-0 flex-1 truncate text-[15px] text-text-secondary">{children}</span>
      {trailing && (
        <span className="num shrink-0 text-[13px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{trailing}</span>
      )}
    </span>
  );
}

/** Text action for ReadOnlyBox's trailing slot: "CHANGE", "ME". */
export function ReadOnlyAction({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "num cursor-pointer text-[13px] font-semibold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
