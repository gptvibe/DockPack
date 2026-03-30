import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label="Workspace local" status="active" />}
          description="These controls represent builder-wide defaults rather than project-specific packaging decisions."
          eyebrow="Appearance"
          title="Theme and workspace feel"
        >
          <div className="flex flex-col gap-6 rounded-[24px] border border-border/60 bg-background/80 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-foreground">Color mode</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep the builder comfortable for long packaging sessions while preserving the same premium layout in light and dark themes.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </AppCard>

        <AppCard
          description="Strong defaults reduce repetitive setup for every new package project."
          eyebrow="Default Paths"
          title="Workspace preferences"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="projects-directory">Projects directory</Label>
              <Input defaultValue="C:\\Users\\fungk\\DockPack\\projects" id="projects-directory" />
            </div>
            <div className="space-y-3">
              <Label htmlFor="output-directory">Build output directory</Label>
              <Input defaultValue="C:\\Users\\fungk\\DockPack\\output" id="output-directory" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg">Save defaults</Button>
            <Button size="lg" variant="outline">Reset sample values</Button>
          </div>
        </AppCard>
      </div>

      <div className="grid gap-6">
        <AppCard
          description="Settings should reinforce product boundaries as much as they store preferences."
          eyebrow="Guardrails"
          title="Recommended product language"
        >
          <div className="space-y-4 text-sm leading-6 text-muted-foreground">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              Describe outputs as a Windows launcher and installer that manage a container behind the scenes.
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              Keep one-container support explicit until the packaging engine can handle broader orchestration safely.
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              Prefer plain English runtime messaging over infrastructure-heavy Docker terminology in the end-user experience.
            </div>
          </div>
        </AppCard>

        <AppCard
          action={<StatusBadge label="Scaffold ready" status="success" />}
          description="This route can later absorb persisted workspace settings from a manifest or local storage service without changing the layout model."
          eyebrow="Future Wiring"
          title="Next backend integrations"
        >
          <div className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Persist theme, output paths, and recent workspace choices</div>
            <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Connect settings to Rust commands for filesystem validation</div>
            <div className="rounded-[20px] border border-border/60 bg-background/80 px-4 py-3">Add real installer defaults and build-environment checks</div>
          </div>
        </AppCard>
      </div>
    </div>
  );
}
