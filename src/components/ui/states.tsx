import { CircleX, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/lib/error-message";
import { Button } from "./button";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-skeleton rounded-lg bg-secondary", className)} />;
}

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  /** Optional 40px tile above the title. */
  icon?: ReactNode;
}

export function EmptyState({ title, children, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border-strong px-6 py-10 text-center">
      {icon && (
        <span className="mb-3 flex size-10 items-center justify-center rounded-[10px] border border-border-strong bg-secondary text-muted-foreground">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-md text-[15px] leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}

interface ErrorStateProps {
  error: unknown;
  /** Bold heading above the message, e.g. "Could not load balances". Omit for inline form errors. */
  title?: string;
  /** Small mono line under the message, e.g. the request that failed. */
  request?: string;
  onRetry?: () => void;
}

export function ErrorState({ error, title, request, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/6 px-4 py-3.5"
    >
      <CircleX className="mt-px size-[18px] shrink-0 text-destructive" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>}
        <p className="text-[15px] leading-normal text-text-secondary">{errorMessage(error)}</p>
        {request && <p className="num mt-1 text-[13px] text-muted-foreground">{request}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="shrink-0">
          <RotateCcw className="size-3.5" aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}
