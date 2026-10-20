import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** 36x20 toggle: lime when on, neutral track when off. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        checked ? "bg-primary" : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full shadow-sm transition-transform",
          // Knob is dark on lime, light on the neutral track, so it reads in both themes.
          checked ? "translate-x-4 bg-primary-foreground" : "bg-foreground",
        )}
      />
    </button>
  );
}

/** A labelled row wrapping a Switch; clicking anywhere on the row toggles it. */
export function ToggleRow({ label, checked, onChange, children }: SwitchProps & { children?: ReactNode }) {
  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-secondary/50 px-4 py-3"
      onClick={() => onChange(!checked)}
    >
      <span className="min-w-0 text-sm text-foreground">
        {label}
        {children}
      </span>
      <span onClick={(event) => event.stopPropagation()}>
        <Switch checked={checked} onChange={onChange} label={label} />
      </span>
    </div>
  );
}
