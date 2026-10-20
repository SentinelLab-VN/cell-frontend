import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-border-strong bg-secondary text-foreground hover:bg-border",
  outline: "border border-border-strong bg-transparent text-foreground hover:bg-secondary",
  ghost: "bg-transparent text-foreground hover:bg-secondary",
  danger: "border border-destructive/70 bg-destructive/8 text-destructive hover:bg-destructive/16",
};

const sizes: Record<Size, string> = {
  sm: "h-8 rounded-lg px-3 text-[15px]",
  md: "h-10 rounded-[10px] px-4 text-sm",
  // Taller touch target on phones.
  lg: "h-12 rounded-[10px] px-5 text-[17px] max-md:h-[52px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors [&_svg]:shrink-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
        loading && "cursor-progress opacity-70 disabled:cursor-progress disabled:opacity-70",
        block && "w-full",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
