import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./pill";

const labels: Record<Tone, string> = {
  ok: "text-success",
  warn: "text-warning",
  danger: "text-destructive",
  info: "text-info",
  accent: "text-primary",
  neutral: "text-dim",
};

/** The callout under a form: a mono label and a paragraph that says why. */
export function Note({ tone = "neutral", label, children }: { tone?: Tone; label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/60 px-4 py-3.5">
      <p className={cn("num mb-1.5 text-[10px] font-medium tracking-[0.2em] uppercase", labels[tone])}>{label}</p>
      <div className="text-[13px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
