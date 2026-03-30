import type { ReactNode } from "react";

import { cn } from "../lib/cn";

interface PageHeaderProps {
  actions?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  meta?: ReactNode;
  status?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ actions, className, description, eyebrow, meta, status, title }: PageHeaderProps) {
  return (
    <section
      className={cn(
        "rounded-[32px] border border-border/60 bg-card/72 p-6 shadow-panel backdrop-blur-xl sm:p-7 lg:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            {status}
          </div>

          {description ? <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p> : null}
          {meta ? <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{meta}</div> : null}
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3 xl:justify-end">{actions}</div> : null}
      </div>
    </section>
  );
}
