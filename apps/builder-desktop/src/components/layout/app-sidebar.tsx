import { ArrowUpRight, Boxes, Clock3 } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { StatusBadge } from "@/components/shared/status-badge";
import { Separator } from "@/components/ui/separator";
import { projectHistory } from "@/data/project-history";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const latestProject = projectHistory[0];

export function AppSidebar() {
  return (
    <aside className="border-b border-border/60 bg-card/65 backdrop-blur-xl lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 p-4 sm:p-6">
        <div className="rounded-[28px] border border-border/60 bg-background/85 p-5 shadow-panel">
          <Link className="flex items-start gap-4" to="/">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/12 text-primary">
              <Boxes className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">DockPack</p>
              <h1 className="font-display text-xl font-semibold text-foreground">Builder</h1>
              <p className="text-sm leading-6 text-muted-foreground">
                Package one-container apps into a polished Windows launcher and installer flow.
              </p>
            </div>
          </Link>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-4 rounded-[24px] border border-transparent px-4 py-3.5 transition-all duration-200",
                    isActive
                      ? "border-primary/25 bg-primary/12 text-foreground shadow-panel"
                      : "text-muted-foreground hover:border-border/60 hover:bg-background/70 hover:text-foreground",
                  )
                }
                end={item.to === "/"}
                to={item.to}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/80 text-inherit">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="truncate text-sm text-muted-foreground">{item.description}</p>
                </div>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-5 rounded-[28px] border border-border/60 bg-background/85 p-5 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Latest project</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{latestProject.name}</p>
            </div>
            <StatusBadge status={latestProject.status} />
          </div>

          <Separator />

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Updated
              </span>
              <span>{latestProject.updatedAt}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Source</span>
              <span>{latestProject.sourceType}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Version</span>
              <span>{latestProject.version}</span>
            </div>
          </div>

          <Link className="flex items-center justify-between text-sm font-semibold text-foreground transition-colors hover:text-primary" to="/build">
            Open build pipeline
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
