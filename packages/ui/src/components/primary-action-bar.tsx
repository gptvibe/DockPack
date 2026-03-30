import type { ReactNode } from "react";

import { cn } from "../lib/cn";

interface PrimaryActionBarProps {
  className?: string;
  description?: ReactNode;
  meta?: ReactNode;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  sticky?: boolean;
  tertiaryAction?: ReactNode;
  title?: ReactNode;
}

export function PrimaryActionBar({
  className,
  description,
  meta,
  primaryAction,
  secondaryAction,
  sticky = false,
  tertiaryAction,
  title,
}: PrimaryActionBarProps) {
  return (
    <div className={cn(sticky ? "sticky bottom-4 z-10" : "", className)}>
      <div className="rounded-[28px] border border-border/60 bg-card/88 p-5 shadow-panel backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            {title ? <p className="font-display text-xl font-semibold tracking-tight text-foreground">{title}</p> : null}
            {description ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
            {meta ? <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{meta}</div> : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {tertiaryAction}
            {secondaryAction}
            {primaryAction}
          </div>
        </div>
      </div>
    </div>
  );
}