import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type StepState = "done" | "current" | "upcoming";

export interface TimelineStep {
  title: string;
  detail?: string;
  state: StepState;
}

function Dot({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-[11px]" strokeWidth={3} aria-hidden />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex size-5 items-center justify-center rounded-full border-2 border-primary">
        <span className="size-1.5 animate-pulse-soft rounded-full bg-primary" />
      </span>
    );
  }
  return <span className="size-5 rounded-full border-2 border-border-strong" />;
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={step.title} className={cn("relative flex gap-3", !last && "pb-5")}>
            {/* Connector runs from this dot to the next; lime once this step is done. */}
            {!last && (
              <span
                className={cn("absolute top-5 bottom-0 left-[9px] w-0.5", step.state === "done" ? "bg-primary" : "bg-border")}
                aria-hidden
              />
            )}
            <span className="relative shrink-0" aria-hidden>
              <Dot state={step.state} />
            </span>
            <div className="min-w-0 pt-px">
              <p
                className={cn(
                  "text-[15px] leading-[18px]",
                  step.state === "upcoming" ? "font-normal text-muted-foreground" : "font-semibold text-foreground",
                )}
              >
                {step.title}
              </p>
              {step.detail && <p className="num mt-0.5 text-[13px] text-dim">{step.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
