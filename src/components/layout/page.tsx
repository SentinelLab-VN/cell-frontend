import type { ReactNode } from "react";

interface PageProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/** A screen inside the app shell: a header band, then the content. */
export function Page({ title, subtitle, actions, children }: PageProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-start justify-between gap-6 border-b border-border px-8 pt-6 pb-5">
        <div className="min-w-0">
          <h1 className="text-[22px] leading-tight font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className="flex-1 px-8 py-6">{children}</div>
    </div>
  );
}
