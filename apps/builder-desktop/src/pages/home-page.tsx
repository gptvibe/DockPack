import { ArrowRight, Boxes, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper, type StepItem } from "@/components/shared/stepper";
import { buttonVariants } from "@/components/ui/button";
import { projectHistory } from "@/data/project-history";

const builderFlow: StepItem[] = [
  {
    id: "intake",
    title: "Capture the source",
    description: "Paste a Docker Hub or GitHub URL, normalize it, and keep the input beginner-friendly.",
    status: "complete",
  },
  {
    id: "analyze",
    title: "Confirm one-container fit",
    description: "Validate packaging assumptions early so unsupported projects do not move into a broken build flow.",
    status: "current",
  },
  {
    id: "package",
    title: "Shape the installer experience",
    description: "Collect the launch profile, branding, ports, and environment defaults that the generated launcher needs.",
    status: "upcoming",
  },
  {
    id: "build",
    title: "Generate launcher artifacts",
    description: "Assemble the runtime manifest, copy the launcher template, and prepare the Windows installable output.",
    status: "upcoming",
  },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      <AppCard
        className="border-primary/15 bg-gradient-to-br from-card via-card to-primary/10"
        contentClassName="space-y-8"
        description="A premium desktop workspace for turning one-container apps into a familiar Windows launcher and installer flow."
        eyebrow="Builder Overview"
        title="Package containerized apps without exposing Docker to end users"
      >
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label="Installer-first workflow" status="ready" />
              <StatusBadge label="Tauri + React scaffold" status="active" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Projects</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">{projectHistory.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">Mock history entries ready for a real project store.</p>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">MVP focus</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">1</p>
                <p className="mt-2 text-sm text-muted-foreground">Container per package with guided validation before build.</p>
              </div>
              <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Runtime framing</p>
                <p className="mt-4 text-3xl font-semibold text-foreground">Honest</p>
                <p className="mt-2 text-sm text-muted-foreground">Launcher and installer around a managed container, not native conversion.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants({ size: "lg" })} to="/analyze">
                Start a new package
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link className={buttonVariants({ size: "lg", variant: "outline" })} to="/build">
                Open build pipeline
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/60 bg-background/78 p-6 shadow-panel">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Flow preview</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">Builder journey</h3>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <Stepper steps={builderFlow} />
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AppCard
          action={<StatusBadge label="Mock data" status="draft" />}
          description="Saved projects should feel easy to reopen, inspect, and continue from the right step without losing packaging context."
          eyebrow="Project History"
          title="Recent packaging work"
        >
          <div className="space-y-4">
            {projectHistory.map((project) => (
              <div key={project.id} className="rounded-[24px] border border-border/60 bg-background/80 p-5 transition-colors hover:border-primary/20">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{project.summary}</p>
                  </div>

                  <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3 lg:text-right">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em]">Source</p>
                      <p className="mt-2 text-foreground">{project.sourceType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em]">Version</p>
                      <p className="mt-2 text-foreground">{project.version}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em]">Updated</p>
                      <p className="mt-2 text-foreground">{project.updatedAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppCard>

        <div className="grid gap-6">
          <AppCard
            description="Keep the product framing consistent from the builder UI through the generated runtime."
            eyebrow="Packaging posture"
            title="What this builder should communicate"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-[24px] border border-border/60 bg-background/80 p-5">
                <Boxes className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Container-managed launcher</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The output should present a Windows install and launch flow while managing the container behind the scenes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-[24px] border border-border/60 bg-background/80 p-5">
                <ShieldCheck className="mt-1 h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold text-foreground">Early compatibility checks</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Unsupported projects should fail fast with clear reasons before the user spends time on packaging details.
                  </p>
                </div>
              </div>
            </div>
          </AppCard>

          <AppCard
            description="The initial scaffold already includes the layout pieces the product needs."
            eyebrow="Included scaffold"
            title="What is ready now"
          >
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Sidebar navigation with five product routes</div>
              <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Top header with route-aware copy and theme toggle</div>
              <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Reusable cards, status badges, and stepper components</div>
              <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Mock project history for early layout and flow development</div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  );
}
