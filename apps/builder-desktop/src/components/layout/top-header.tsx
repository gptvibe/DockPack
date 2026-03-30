import { Link, useLocation } from "react-router-dom";

import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getNavigationMeta } from "@/lib/navigation";

export function TopHeader() {
  const location = useLocation();
  const meta = getNavigationMeta(location.pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/72 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">DockPack Builder</p>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{meta.headerTitle}</h2>
            <StatusBadge label="One-container MVP" status="active" />
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{meta.headerSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />
          <Link className={buttonVariants({ variant: "outline", size: "sm" })} to="/settings">
            Workspace defaults
          </Link>
          <Link className={buttonVariants({ size: "sm" })} to="/analyze">
            New package
          </Link>
        </div>
      </div>
    </header>
  );
}
