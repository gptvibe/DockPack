import type { ReactNode } from "react";

import { AlertCircle, Boxes, Sparkles } from "lucide-react";

import { cn } from "../lib/cn";
import { SectionCard } from "./section-card";
import type { StatusTone } from "./status-badge";

type EmptyStateTone = Exclude<StatusTone, "building"> | "neutral";

const toneClasses: Record<EmptyStateTone, string> = {
  active: "bg-primary/12 text-primary",
  draft: "bg-muted text-muted-foreground",
  error: "bg-danger/12 text-danger",
  neutral: "bg-accent text-accent-foreground",
  ready: "bg-success/12 text-success",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
};

interface EmptyStateProps {
  action?: ReactNode;
  className?: string;
  description: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  secondaryAction?: ReactNode;
  title: ReactNode;
  tone?: EmptyStateTone;
}

function getToneIcon(tone: EmptyStateTone) {
  if (tone === "warning" || tone === "error") {
    return <AlertCircle className="h-6 w-6" />;
  }

  if (tone === "success" || tone === "ready" || tone === "active") {
    return <Sparkles className="h-6 w-6" />;
  }

  return <Boxes className="h-6 w-6" />;
}

export function EmptyState({
  action,
  className,
  description,
  eyebrow = "Nothing here yet",
  icon,
  secondaryAction,
  title,
  tone = "neutral",
}: EmptyStateProps) {
  return (
    <SectionCard className={className}>
      <div className="flex flex-col items-start gap-6 rounded-[24px] border border-dashed border-border/70 bg-background/76 p-6 sm:p-8">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-[20px]", toneClasses[tone])}>
          {icon ?? getToneIcon(tone)}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</p>
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
        </div>

        {(action || secondaryAction) ? (
          <div className="flex flex-wrap items-center gap-3">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
