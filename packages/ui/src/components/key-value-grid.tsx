import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export interface KeyValueGridItem {
  helper?: ReactNode;
  id: string;
  label: string;
  value: ReactNode;
}

const columnClasses = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-4",
} as const;

interface KeyValueGridProps {
  className?: string;
  columns?: keyof typeof columnClasses;
  items: KeyValueGridItem[];
}

export function KeyValueGrid({ className, columns = 2, items }: KeyValueGridProps) {
  return (
    <div className={cn("grid gap-4", columnClasses[columns], className)}>
      {items.map((item) => (
        <div key={item.id} className="rounded-[22px] border border-border/60 bg-background/78 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
          <div className="mt-3 text-lg font-semibold text-foreground">{item.value}</div>
          {item.helper ? <div className="mt-2 text-sm leading-6 text-muted-foreground">{item.helper}</div> : null}
        </div>
      ))}
    </div>
  );
}
