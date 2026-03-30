import type { ReactNode } from "react";

import { cn } from "../lib/cn";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  header?: ReactNode;
  maxWidthClassName?: string;
  sidebar?: ReactNode;
  sidebarClassName?: string;
}

export function AppShell({
  children,
  className,
  contentClassName,
  header,
  maxWidthClassName = "max-w-[1440px]",
  sidebar,
  sidebarClassName,
}: AppShellProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-background text-foreground", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.86),rgba(247,249,252,0.96))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_22%),linear-gradient(180deg,rgba(4,11,24,0.92),rgba(8,15,27,0.98))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:52px_52px] opacity-40 dark:opacity-15" />

      <div className={cn("relative min-h-screen", sidebar ? "lg:grid lg:grid-cols-[320px_1fr]" : "") }>
        {sidebar ? <aside className={cn("border-b border-border/60 bg-card/62 backdrop-blur-xl lg:border-b-0 lg:border-r", sidebarClassName)}>{sidebar}</aside> : null}

        <div className="flex min-h-screen flex-col">
          {header ? <div className="sticky top-0 z-20 border-b border-border/60 bg-background/72 backdrop-blur-2xl">{header}</div> : null}

          <main className={cn("flex-1 p-4 sm:p-6 lg:p-8 xl:p-10", contentClassName)}>
            <div className={cn("mx-auto w-full", maxWidthClassName)}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
