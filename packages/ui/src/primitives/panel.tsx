import * as React from "react";

import { cn } from "../lib/cn";

export const Panel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[28px] border border-border/60 bg-card/80 text-card-foreground shadow-panel backdrop-blur-xl",
          className,
        )}
        {...props}
      />
    );
  },
);

Panel.displayName = "Panel";

export const PanelHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-3 p-6", className)} {...props} />,
);

PanelHeader.displayName = "PanelHeader";

export const PanelTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-display text-xl font-semibold tracking-tight text-foreground", className)} {...props} />
  ),
);

PanelTitle.displayName = "PanelTitle";

export const PanelDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("max-w-3xl text-sm leading-6 text-muted-foreground", className)} {...props} />
  ),
);

PanelDescription.displayName = "PanelDescription";

export const PanelContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />,
);

PanelContent.displayName = "PanelContent";

export const PanelFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-3 px-6 pb-6 pt-0", className)} {...props} />
  ),
);

PanelFooter.displayName = "PanelFooter";