import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppCardProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: string;
  eyebrow?: string;
  title?: string;
}

export function AppCard({
  action,
  children,
  className,
  contentClassName,
  description,
  eyebrow,
  title,
}: AppCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description || eyebrow || action) && (
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">{eyebrow}</p> : null}
              {title ? <CardTitle>{title}</CardTitle> : null}
              {description ? <CardDescription>{description}</CardDescription> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>{children}</CardContent>
    </Card>
  );
}
