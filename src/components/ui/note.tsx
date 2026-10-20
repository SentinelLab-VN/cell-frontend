import { Check, CircleX, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./pill";

const icons: Record<Tone, LucideIcon> = {
  ok: Check,
  warn: TriangleAlert,
  danger: CircleX,
  info: Info,
  accent: Info,
  neutral: Info,
};

const frames: Record<Tone, string> = {
  info: "border-info/25 bg-info/5",
  warn: "border-warning/28 bg-warning/5",
  danger: "border-destructive/30 bg-destructive/6",
  ok: "border-success/25 bg-success/5",
  accent: "border-primary-ink/25 bg-primary-ink/5",
  neutral: "border-border bg-secondary/60",
};

const kickers: Record<Tone, string> = {
  ok: "text-success",
  warn: "text-warning",
  danger: "text-destructive",
  info: "text-info",
  accent: "text-primary-ink",
  neutral: "text-dim",
};

/** The callout under a form: an icon, a mono kicker and a paragraph that says why. */
export function Note({ tone = "info", label, children }: { tone?: Tone; label: string; children: ReactNode }) {
  const Icon = icons[tone];
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3.5", frames[tone])}>
      <Icon className={cn("mt-px size-4 shrink-0", kickers[tone])} aria-hidden />
      <div className="min-w-0">
        <p className={cn("num mb-1.5 text-[12px] font-medium tracking-[0.18em] uppercase", kickers[tone])}>{label}</p>
        <div className="text-[15px] leading-[1.55] text-text-secondary">{children}</div>
      </div>
    </div>
  );
}
