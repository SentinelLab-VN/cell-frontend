import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Cards that link somewhere or can be picked lift their border on hover. */
  hover?: boolean;
}

export function Card({ className, hover = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 max-md:p-[18px]",
        hover && "transition-colors hover:border-border-strong",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-sm font-semibold text-foreground", className)} {...props} />;
}

/** A row inside a card: the darker inset box the design uses for list items. */
export function InsetRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3", className)}
      {...props}
    />
  );
}
