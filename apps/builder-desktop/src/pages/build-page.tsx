import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper, type StepItem } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { projectHistory } from "@/data/project-history";

const buildSteps: StepItem[] = [
  {
    id: "prepare",
    title: "Prepare runtime manifest",
    description: "Collect the validated source, package settings, and launcher defaults into the generated runtime profile.",
    status: "complete",
  },
  {
    id: "template",
    title: "Assemble launcher template",
    description: "Copy the launcher template, inject runtime settings, and wire installer metadata for the generated app.",
    status: "current",
  },
  {
    id: "bundle",
    title: "Bundle installer output",
    description: "Create the Windows launcher and installer artifacts for testing and handoff.",
    status: "upcoming",
  },
];

const logLines = [
  "[09:41:03] Packaging manifest loaded from draft project",
  "[09:41:04] Launcher template copied into staging workspace",
  "[09:41:07] Runtime configuration injected for primary port 8080",
  "[09:41:10] Waiting for installer asset pipeline to complete",
];

export function BuildPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge status="building" />}
          description="The build route should communicate stage-based progress clearly enough that users trust long-running generation tasks."
          eyebrow="Pipeline"
          title="Generate the installer and launcher"
        >
          <Stepper steps={buildSteps} />
        </AppCard>

        <AppCard
          description="Even a mock build screen should show where artifacts land and what still needs to happen before a handoff."
          eyebrow="Artifacts"
          title="Current output expectations"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Installer</p>
              <p className="mt-3 text-base font-semibold text-foreground">Pending</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Windows installable package generated after template assembly.</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Launcher</p>
              <p className="mt-3 text-base font-semibold text-foreground">In staging</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Runtime shell is being configured with the current manifest defaults.</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Logs</p>
              <p className="mt-3 text-base font-semibold text-foreground">Streaming</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Stage logs remain visible so failures can be explained without opening a terminal.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg">Generate test build</Button>
            <Button size="lg" variant="outline">Open output folder</Button>
          </div>
        </AppCard>
      </div>

      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label="Mock logs" status="draft" />}
          description="A structured build log panel keeps progress readable without dropping the user into raw terminal output."
          eyebrow="Live Log Preview"
          title="Stage-based feedback"
        >
          <div className="space-y-3 rounded-[24px] border border-border/60 bg-slate-950 p-5 text-sm text-slate-200 shadow-panel">
            {logLines.map((line) => (
              <div key={line} className="font-mono leading-6">
                {line}
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard
          description="Recent project history can also double as a light build queue until a real job system exists."
          eyebrow="Recent Activity"
          title="Projects near the build stage"
        >
          <div className="space-y-4">
            {projectHistory.slice(0, 3).map((project) => (
              <div key={project.id} className="rounded-[24px] border border-border/60 bg-background/80 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{project.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.summary}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </div>
  );
}
