import { cn } from "@/lib/cn";

export type StepState = "done" | "current" | "upcoming";

export interface TimelineStep {
  title: string;
  detail?: string;
  state: StepState;
}

const dot: Record<StepState, string> = {
  done: "bg-success",
  current: "bg-info",
  upcoming: "bg-border-strong",
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol>
      {steps.map((step, index) => (
        <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
          {index < steps.length - 1 && <span className="absolute top-4 left-[3px] h-full w-px bg-border" aria-hidden />}
          <span className={cn("relative mt-1.5 size-[7px] shrink-0 rounded-full", dot[step.state])} aria-hidden />
          <div>
            <p className={cn("text-[13px] font-medium", step.state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
              {step.title}
            </p>
            {step.detail && <p className="num mt-0.5 text-[11px] text-dim">{step.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
