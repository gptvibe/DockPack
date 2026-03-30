import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepStatus = "complete" | "current" | "upcoming";

export interface StepItem {
  description: string;
  id: string;
  status: StepStatus;
  title: string;
}

const stepStatusClasses: Record<StepStatus, string> = {
  complete: "border-success/40 bg-success text-success-foreground",
  current: "border-primary/40 bg-primary text-primary-foreground shadow-glow",
  upcoming: "border-border bg-background text-muted-foreground",
};

export function Stepper({ steps }: { steps: StepItem[] }) {
  return (
    <ol className="space-y-5">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li key={step.id} className="relative flex gap-4 pl-14">
            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-semibold transition-all duration-200",
                  stepStatusClasses[step.status],
                )}
              >
                {step.status === "complete" ? <Check className="h-4 w-4" /> : index + 1}
              </span>
            </div>

            {!isLast ? <span className="absolute left-5 top-11 h-[calc(100%-0.25rem)] w-px bg-border/70" /> : null}

            <div className="space-y-1 pb-6">
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
