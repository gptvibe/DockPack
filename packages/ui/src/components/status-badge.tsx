import { cn } from "../lib/cn";
import { Badge } from "../primitives/badge";

export type StatusTone = "active" | "building" | "draft" | "error" | "ready" | "success" | "warning";

const toneClasses: Record<StatusTone, string> = {
  active: "border-primary/30 bg-primary/12 text-primary",
  building: "border-warning/30 bg-warning/12 text-warning",
  draft: "border-border bg-muted/80 text-muted-foreground",
  error: "border-danger/30 bg-danger/12 text-danger",
  ready: "border-success/30 bg-success/12 text-success",
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/12 text-warning",
};

const labels: Record<StatusTone, string> = {
  active: "Active",
  building: "Building",
  draft: "Draft",
  error: "Needs attention",
  ready: "Ready",
  success: "Success",
  warning: "Review needed",
};

interface StatusBadgeProps {
  className?: string;
  label?: string;
  status: StatusTone;
}

export function getStatusLabel(status: StatusTone) {
  return labels[status];
}

export function StatusBadge({ className, label, status }: StatusBadgeProps) {
  return (
    <Badge className={cn(toneClasses[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>{label ?? getStatusLabel(status)}</span>
    </Badge>
  );
}
