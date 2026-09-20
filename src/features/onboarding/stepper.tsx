import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { STEPS, type StepId } from "./steps";

export function Stepper({ current }: { current: StepId | "live" }) {
  const currentIndex = current === "live" ? STEPS.length : STEPS.findIndex((s) => s.id === current);

  return (
    <ol className="space-y-2.5">
      {STEPS.map((step, index) => {
        const state = index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";
        return (
          <li
            key={step.id}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-3.5 rounded-xl border px-4 py-[15px]",
              state === "current" ? "border-border-strong bg-card" : "border-border",
            )}
          >
            <span
              className={cn(
                "num flex size-[26px] shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                state === "done" && "bg-success text-background",
                state === "current" && "bg-primary text-primary-foreground",
                state === "upcoming" && "bg-secondary text-dim",
              )}
            >
              {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span>
              <span className={cn("block text-sm font-medium", state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
                {step.title}
              </span>
              <span className="block text-xs text-dim">{step.detail}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
