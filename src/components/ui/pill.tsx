import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "ok" | "warn" | "danger" | "info" | "accent" | "neutral";

const dots: Record<Tone, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  accent: "bg-primary-ink",
  neutral: "bg-dim",
};

// Tonal fills: the tinted background and border carry the meaning, not just the dot.
const tones: Record<Tone, string> = {
  ok: "border-success-subtle-border bg-success-subtle text-success",
  warn: "border-warning-subtle-border bg-warning-subtle text-warning",
  danger: "border-danger-subtle-border bg-danger-subtle text-destructive",
  info: "border-info-subtle-border bg-info-subtle text-info",
  accent: "border-primary-subtle-border bg-primary-subtle text-primary-ink",
  neutral: "border-border-strong bg-secondary text-muted-foreground",
};

interface PillProps {
  tone?: Tone;
  /** Replaces the default dot with an 11px icon. */
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function Pill({ tone = "neutral", icon: Icon, children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[13px] font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {Icon ? <Icon className="size-[11px]" aria-hidden /> : <span className={cn("size-[5px] rounded-full", dots[tone])} aria-hidden />}
      {children}
    </span>
  );
}
