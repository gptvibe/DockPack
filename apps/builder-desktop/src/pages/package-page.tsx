import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper, type StepItem } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const packagingSteps: StepItem[] = [
  {
    id: "identity",
    title: "App identity",
    description: "Capture the app name, version, and summary shown across the generated installer and launcher.",
    status: "complete",
  },
  {
    id: "runtime",
    title: "Runtime defaults",
    description: "Set the primary port, startup behavior, and environment values that shape the first-run experience.",
    status: "current",
  },
  {
    id: "review",
    title: "Review installer profile",
    description: "Summarize what end users will install and how the launcher manages the container behind the scenes.",
    status: "upcoming",
  },
];

export function PackagePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label="Draft manifest" status="draft" />}
          description="This route is where branding, installer copy, and runtime assumptions become a coherent Windows experience."
          eyebrow="Package Details"
          title="Shape the installer and launcher profile"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="app-name">Display name</Label>
              <Input defaultValue="Acme Notes" id="app-name" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="app-version">Version</Label>
              <Input defaultValue="0.9.4" id="app-version" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="primary-port">Primary port</Label>
              <Input defaultValue="8080" id="primary-port" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="launch-url">Launch URL path</Label>
              <Input defaultValue="/" id="launch-url" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Label htmlFor="first-run-message">First-run guidance</Label>
            <Textarea
              defaultValue="DockPack installs a Windows launcher and installer that start the packaged app and manage its container runtime behind the scenes."
              id="first-run-message"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg">Save package profile</Button>
            <Button size="lg" variant="outline">Preview summary</Button>
          </div>
        </AppCard>

        <AppCard
          description="Use large, obvious controls for defaults while leaving advanced runtime details available later."
          eyebrow="Runtime Assumptions"
          title="Suggested packaging defaults"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Launcher behavior</p>
              <p className="mt-3 text-base font-semibold text-foreground">Open app after health check</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Installer output</p>
              <p className="mt-3 text-base font-semibold text-foreground">Desktop shortcut + Start menu entry</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Support posture</p>
              <p className="mt-3 text-base font-semibold text-foreground">Beginner-friendly runtime errors</p>
            </div>
          </div>
        </AppCard>
      </div>

      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label="Config stage" status="active" />}
          description="This same stepper can be reused anywhere the builder needs to reinforce stage-based progress."
          eyebrow="Packaging Flow"
          title="Where this route sits in the journey"
        >
          <Stepper steps={packagingSteps} />
        </AppCard>

        <AppCard
          description="A concise review panel helps new users understand what they are actually generating before the build starts."
          eyebrow="Review Preview"
          title="Installer summary snapshot"
        >
          <div className="space-y-4">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">What users will install</p>
              <p className="mt-3 text-base font-semibold text-foreground">DockPack-generated launcher and Windows installer</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">How it behaves</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The launcher starts the containerized app, waits for readiness, then opens the primary experience without requiring end users to run Docker manually.
              </p>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
