import { AlertTriangle, CheckCircle2, Dot, Info, RefreshCw } from "lucide-react";

import { cn } from "../lib/cn";
import { SectionCard } from "./section-card";

export type LogLevel = "error" | "info" | "success" | "warning";

export interface LogEntry {
  id: string;
  label?: string;
  level?: LogLevel;
  message: string;
  timestamp?: string;
}

const rowClasses: Record<LogLevel, string> = {
  error: "border-danger/20 bg-danger/8",
  info: "border-border/70 bg-background/80",
  success: "border-success/20 bg-success/8",
  warning: "border-warning/20 bg-warning/8",
};

const textClasses: Record<LogLevel, string> = {
  error: "text-danger",
  info: "text-foreground",
  success: "text-success",
  warning: "text-warning",
};

function getLevelIcon(level: LogLevel) {
  if (level === "success") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (level === "warning") {
    return <AlertTriangle className="h-4 w-4" />;
  }

  if (level === "error") {
    return <RefreshCw className="h-4 w-4" />;
  }

  return <Info className="h-4 w-4" />;
}

interface LogPanelProps {
  className?: string;
  description?: string;
  emptyMessage?: string;
  entries: LogEntry[];
  maxHeightClassName?: string;
  title?: string;
}

export function LogPanel({
  className,
  description,
  emptyMessage = "Build and runtime messages will appear here once the workflow starts.",
  entries,
  maxHeightClassName = "max-h-[420px]",
  title = "Activity",
}: LogPanelProps) {
  return (
    <SectionCard className={className} description={description} eyebrow="Log Panel" title={title}>
      <div className={cn("space-y-3 overflow-auto pr-1", maxHeightClassName)}>
        {entries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border/70 bg-background/78 px-5 py-6 text-sm leading-6 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : null}

        {entries.map((entry) => {
          const level = entry.level ?? "info";

          return (
            <div key={entry.id} className={cn("rounded-[22px] border px-4 py-4", rowClasses[level])}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn("mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-background/90", textClasses[level])}>
                    {getLevelIcon(level)}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.label ? <p className="text-sm font-semibold text-foreground">{entry.label}</p> : null}
                      <span className={cn("inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.18em]", textClasses[level])}>
                        <Dot className="h-4 w-4" />
                        {level}
                      </span>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{entry.message}</p>
                  </div>
                </div>

                {entry.timestamp ? <p className="pl-11 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground sm:pl-0">{entry.timestamp}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
