import { useState } from "react";

import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper, type StepItem } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const analysisSteps: StepItem[] = [
  {
    id: "validate-input",
    title: "Validate the pasted source",
    description: "Normalize the URL, identify whether it is Docker Hub or GitHub, and reject invalid patterns early.",
    status: "complete",
  },
  {
    id: "single-container",
    title: "Check one-container viability",
    description: "Confirm the source maps to a single-container app and highlight unsupported multi-service assumptions.",
    status: "current",
  },
  {
    id: "infer-defaults",
    title: "Infer packaging defaults",
    description: "Collect image or repository hints so the packaging screen can start with strong defaults instead of a blank form.",
    status: "upcoming",
  },
];

export function AnalyzePage() {
  const [sourceType, setSourceType] = useState<"dockerHub" | "github">("dockerHub");
  const [sourceUrl, setSourceUrl] = useState("https://hub.docker.com/r/acme/notes-desktop");
  const [notes, setNotes] = useState(
    "Target a single HTTP port, preserve a clean first-run experience, and keep all runtime messaging beginner-friendly.",
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <AppCard
        action={<StatusBadge label="Input ready" status="active" />}
        description="Paste a Docker Hub image or GitHub repository URL, then guide the user into analysis without showing raw container jargon upfront."
        eyebrow="Source Intake"
        title="Start with a clear source"
      >
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              className={cn(
                "rounded-[24px] border p-5 text-left transition-all duration-200",
                sourceType === "dockerHub"
                  ? "border-primary/30 bg-primary/10 shadow-panel"
                  : "border-border/60 bg-background/75 hover:border-primary/20",
              )}
              onClick={() => setSourceType("dockerHub")}
              type="button"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Option A</p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">Docker Hub image</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Best for packaging an existing image reference with clear runtime assumptions.
              </p>
            </button>

            <button
              className={cn(
                "rounded-[24px] border p-5 text-left transition-all duration-200",
                sourceType === "github"
                  ? "border-primary/30 bg-primary/10 shadow-panel"
                  : "border-border/60 bg-background/75 hover:border-primary/20",
              )}
              onClick={() => setSourceType("github")}
              type="button"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Option B</p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">GitHub repository</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Best for repositories that already contain a Dockerfile or a clean one-container build path.
              </p>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="source-url">Source URL</Label>
              <Input id="source-url" onChange={(event) => setSourceUrl(event.target.value)} value={sourceUrl} />
            </div>

            <div className="space-y-3">
              <Label htmlFor="analysis-notes">Builder notes</Label>
              <Textarea id="analysis-notes" onChange={(event) => setNotes(event.target.value)} value={notes} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg">Run analysis</Button>
            <Button size="lg" variant="outline">Save draft</Button>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label="Supported with review" status="warning" />}
          description="This scaffold shows how the compatibility verdict can remain clear, honest, and beginner-friendly."
          eyebrow="Compatibility Snapshot"
          title="Current mock verdict"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Detected input</p>
              <p className="mt-3 text-base font-semibold text-foreground">
                {sourceType === "dockerHub" ? "Docker Hub image reference" : "GitHub repository"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{sourceUrl}</p>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Detected profile</p>
              <p className="mt-3 text-base font-semibold text-foreground">Single-container app candidate</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Primary web port is likely available, but environment defaults still need confirmation.
              </p>
            </div>
          </div>
        </AppCard>

        <AppCard
          description="A reusable stepper keeps every route aligned with the same guided product language."
          eyebrow="Analysis Flow"
          title="What the next checks should surface"
        >
          <Stepper steps={analysisSteps} />
        </AppCard>
      </div>
    </div>
  );
}
