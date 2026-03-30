import { Badge } from "@/components/ui/badge";
import { type StatusTone, getStatusLabel } from "@/lib/status";
import { cn } from "@/lib/utils";

const toneClasses: Record<StatusTone, string> = {
  active: "border-primary/30 bg-primary/12 text-primary",
  building: "border-warning/30 bg-warning/12 text-warning",
  draft: "border-border bg-muted/80 text-muted-foreground",
  error: "border-danger/30 bg-danger/12 text-danger",
  ready: "border-success/30 bg-success/12 text-success",
  success: "border-success/30 bg-success/12 text-success",
  warning: "border-warning/30 bg-warning/12 text-warning",
};

interface StatusBadgeProps {
  className?: string;
  label?: string;
  status: StatusTone;
}

export function StatusBadge({ className, label, status }: StatusBadgeProps) {
  return <Badge className={cn(toneClasses[status], className)}>{label ?? getStatusLabel(status)}</Badge>;
}
