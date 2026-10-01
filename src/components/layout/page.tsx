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
      <header className="border-b border-sidebar-border">
        {/* Header and content share one centred column, so the title lines up with what is under it. */}
        <div className="mx-auto flex w-full max-w-[1040px] items-start justify-between gap-6 px-10 pt-7 pb-5 max-md:gap-3 max-md:px-4 max-md:pt-5">
          <div className="min-w-0">
            <h1 className="text-2xl leading-tight font-semibold tracking-[-0.015em] text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-[15px] text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1040px] flex-1 px-10 py-7 max-md:px-4 max-md:py-5">{children}</div>
    </div>
  );
}
