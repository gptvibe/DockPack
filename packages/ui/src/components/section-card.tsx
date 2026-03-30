import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from "../primitives/panel";

interface SectionCardProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
}

export function SectionCard({
  action,
  children,
  className,
  contentClassName,
  description,
  eyebrow,
  footer,
  title,
}: SectionCardProps) {
  return (
    <Panel className={cn("overflow-hidden", className)}>
      {(eyebrow || title || description || action) && (
        <PanelHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">{eyebrow}</p> : null}
              {title ? <PanelTitle>{title}</PanelTitle> : null}
              {description ? <PanelDescription>{description}</PanelDescription> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </PanelHeader>
      )}
      <PanelContent className={contentClassName}>{children}</PanelContent>
      {footer ? <PanelFooter>{footer}</PanelFooter> : null}
    </Panel>
  );
}
