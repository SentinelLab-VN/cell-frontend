import * as RadixDialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Panel width in px, 480 by default; wider content may go up to 520. */
  width?: number;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, width = 480 }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-[rgba(5,5,6,0.7)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <RadixDialog.Content
          style={{ width: `min(${Math.min(width, 520)}px, calc(100vw - 2rem))` }}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-2xl border border-border-strong bg-card p-7 shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div>
            <RadixDialog.Title className="text-xl font-semibold tracking-[-0.01em] text-foreground">{title}</RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="mt-1.5 text-[15px] leading-normal text-muted-foreground">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <div className="space-y-4">{children}</div>
          {footer && <div className="flex justify-end gap-2">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
