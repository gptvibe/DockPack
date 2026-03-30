import { ArrowRight, Boxes, FolderOpen, MoonStar, Search, Settings2, Sparkles } from "lucide-react";

import { AppShell } from "../components/app-shell";
import { EmptyState } from "../components/empty-state";
import { KeyValueGrid } from "../components/key-value-grid";
import { LogPanel } from "../components/log-panel";
import { PageHeader } from "../components/page-header";
import { PrimaryActionBar } from "../components/primary-action-bar";
import { SectionCard } from "../components/section-card";
import { StatusBadge } from "../components/status-badge";
import { Stepper } from "../components/stepper";
import { Button } from "../primitives/button";

const exampleSteps = [
  {
    id: "source",
    title: "Collect the source",
    description: "Start from a Docker Hub image or GitHub repository and keep the first decision easy to understand.",
    status: "complete",
    meta: "Done",
  },
  {
    id: "fit",
    title: "Confirm one-container fit",
    description: "Show a clear supported or unsupported verdict before the user starts editing packaging details.",
    status: "current",
    meta: "Current",
  },
  {
    id: "package",
    title: "Prepare the installer profile",
    description: "Collect names, ports, and first-run guidance in a way that feels closer to a setup assistant than a dev tool.",
    status: "upcoming",
    meta: "Next",
  },
] as const;

const exampleLogs = [
  {
    id: "1",
    label: "Source check",
    message: "GitHub repository detected and normalized successfully.",
    timestamp: "09:41 AM",
    level: "success",
  },
  {
    id: "2",
    label: "Compatibility review",
    message: "The project looks compatible with the one-container MVP, but install-time settings still need confirmation.",
    timestamp: "09:42 AM",
    level: "warning",
  },
  {
    id: "3",
    label: "Packaging stage",
    message: "Launcher template selected. The build will be ready to start once app identity is finalized.",
    timestamp: "09:43 AM",
    level: "info",
  },
] as const;

const exampleFacts = [
  {
    id: "name",
    label: "Project",
    value: "Acme Notes",
    helper: "Beginner-friendly installer flow for a single-container notes app.",
  },
  {
    id: "source",
    label: "Source",
    value: "GitHub repository",
    helper: "Repository includes a clean Dockerfile path and a primary web port.",
  },
  {
    id: "status",
    label: "Readiness",
    value: "Supported with review",
    helper: "Proceed after confirming environment defaults and first-run copy.",
  },
  {
    id: "output",
    label: "Output",
    value: "Windows launcher + installer",
    helper: "The result manages a container behind the scenes rather than pretending to be a native conversion.",
  },
] as const;

const sidebarLinks = [
  { icon: Boxes, label: "Home" },
  { icon: Search, label: "Analyze" },
  { icon: FolderOpen, label: "Package" },
  { icon: Sparkles, label: "Build" },
  { icon: Settings2, label: "Settings" },
];

function ExampleSidebar() {
  return (
    <div className="flex h-full flex-col gap-6 p-5 sm:p-6">
      <div className="rounded-[28px] border border-border/60 bg-background/84 p-5 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">DockPack</p>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">Design System</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Soft surfaces, calm spacing, and plain language for users who should not feel dropped into infrastructure tooling.
        </p>
      </div>

      <nav className="space-y-2">
        {sidebarLinks.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={index === 1 ? "flex items-center gap-4 rounded-[24px] border border-primary/24 bg-primary/10 px-4 py-3.5 shadow-panel" : "flex items-center gap-4 rounded-[24px] border border-transparent px-4 py-3.5 text-muted-foreground"}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/84">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[28px] border border-border/60 bg-background/84 p-5 shadow-panel">
        <StatusBadge label="Design preview" status="active" />
        <p className="mt-4 text-sm leading-6 text-muted-foreground">A shared visual language for the builder and launcher without slipping into terminal-first styling.</p>
      </div>
    </div>
  );
}

function ExampleShellHeader() {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Shared Layout</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">Premium, calm, and beginner-friendly</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" variant="outline">
          <MoonStar className="h-4 w-4" />
          Theme
        </Button>
        <Button size="sm">
          New package
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ExampleAppShell() {
  return (
    <div className="dockpack-theme min-h-screen">
      <AppShell header={<ExampleShellHeader />} sidebar={<ExampleSidebar />}>
        <SectionCard
          eyebrow="AppShell"
          title="Use one shell for both immersive pages and guided flows"
          description="The shell gives DockPack a premium frame without feeling like a code editor or infrastructure dashboard."
          action={<StatusBadge label="Layout example" status="ready" />}
        >
          <p className="text-sm leading-7 text-muted-foreground">
            Pair this shell with PageHeader, SectionCard, and PrimaryActionBar to keep large workflows spacious and predictable.
          </p>
        </SectionCard>
      </AppShell>
    </div>
  );
}

export function ExamplePageHeader() {
  return (
    <div className="dockpack-theme">
      <PageHeader
        eyebrow="PageHeader"
        title="Analyze source"
        description="Guide the user through the compatibility verdict with clear next steps and no unnecessary Docker vocabulary."
        status={<StatusBadge status="warning" />}
        meta={<span>Last updated 12 minutes ago</span>}
        actions={
          <>
            <Button variant="outline">Save draft</Button>
            <Button>Run analysis</Button>
          </>
        }
      />
    </div>
  );
}

export function ExampleStatusBadges() {
  return (
    <div className="dockpack-theme flex flex-wrap gap-3">
      <StatusBadge status="active" />
      <StatusBadge status="ready" />
      <StatusBadge status="warning" />
      <StatusBadge status="building" />
      <StatusBadge status="draft" />
      <StatusBadge status="error" />
    </div>
  );
}

export function ExampleEmptyState() {
  return (
    <div className="dockpack-theme">
      <EmptyState
        eyebrow="EmptyState"
        title="No package project selected"
        description="Start with a Docker Hub image or GitHub repository and DockPack will guide the rest of the packaging flow step by step."
        action={<Button>Start a package</Button>}
        secondaryAction={<Button variant="outline">Open project history</Button>}
      />
    </div>
  );
}

export function ExampleStepper() {
  return (
    <div className="dockpack-theme">
      <SectionCard eyebrow="Stepper" title="Show guided progress without feeling technical">
        <Stepper steps={[...exampleSteps]} />
      </SectionCard>
    </div>
  );
}

export function ExampleLogPanel() {
  return (
    <div className="dockpack-theme">
      <LogPanel
        title="Build activity"
        description="Use softer rows and clear language so activity feels understandable to nontechnical users."
        entries={[...exampleLogs]}
      />
    </div>
  );
}

export function ExampleKeyValueGrid() {
  return (
    <div className="dockpack-theme">
      <SectionCard eyebrow="KeyValueGrid" title="Summaries should be compact and easy to scan">
        <KeyValueGrid columns={2} items={[...exampleFacts]} />
      </SectionCard>
    </div>
  );
}

export function ExampleSectionCard() {
  return (
    <div className="dockpack-theme">
      <SectionCard
        eyebrow="SectionCard"
        title="Group related information into soft, roomy panels"
        description="This is the main content surface for settings, summaries, activity, and supportive guidance across DockPack."
        action={<StatusBadge label="Shared surface" status="success" />}
        footer={<Button variant="outline">Secondary action</Button>}
      >
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Use SectionCard when the content deserves framing but should still feel calm, bright, and approachable.</p>
          <p>It works well for route sections, onboarding guidance, summaries, and progress-related content.</p>
        </div>
      </SectionCard>
    </div>
  );
}

export function ExamplePrimaryActionBar() {
  return (
    <div className="dockpack-theme">
      <PrimaryActionBar
        title="Ready to generate your installer"
        description="Keep the main action obvious, but still leave space for a quieter secondary path and a small amount of supporting context."
        meta={<StatusBadge label="Draft saved" status="draft" />}
        secondaryAction={<Button variant="outline">Back</Button>}
        primaryAction={<Button>Generate build</Button>}
      />
    </div>
  );
}

export function DockPackDesignSystemShowcase() {
  return (
    <div className="dockpack-theme min-h-screen">
      <AppShell header={<ExampleShellHeader />} sidebar={<ExampleSidebar />}>
        <div className="space-y-6">
          <PageHeader
            eyebrow="DockPack Design System"
            title="Small, premium building blocks for calm product UI"
            description="These components are intended for the builder and launcher flows, with an emphasis on plain language, generous spacing, and soft surfaces instead of developer-heavy visuals."
            status={<StatusBadge status="active" />}
            actions={
              <>
                <Button variant="outline">Read usage examples</Button>
                <Button>
                  Apply to builder
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            }
          />

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard
              eyebrow="SectionCard + Stepper"
              title="Keep workflows understandable"
              description="Use a vertical stepper when the user needs progress context, but avoid cluttering it with system detail that does not help decision-making."
              action={<StatusBadge label="Guided flow" status="ready" />}
            >
              <Stepper steps={[...exampleSteps]} />
            </SectionCard>

            <EmptyState
              eyebrow="EmptyState"
              title="A fresh workspace should still feel helpful"
              description="Offer one clear next step and one quieter fallback, without showing a blank technical canvas."
              action={<Button>Start packaging</Button>}
              secondaryAction={<Button variant="outline">Browse recent projects</Button>}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <LogPanel
              title="LogPanel"
              description="Show build and runtime progress in plain language with supportive, not terminal-like, presentation."
              entries={[...exampleLogs]}
            />

            <SectionCard
              eyebrow="KeyValueGrid"
              title="Summaries should answer the main questions quickly"
              description="Nontechnical users need the high-level facts first: what this is, where it came from, whether it is ready, and what the output will do."
            >
              <KeyValueGrid columns={2} items={[...exampleFacts]} />
            </SectionCard>
          </div>

          <SectionCard
            eyebrow="StatusBadge"
            title="A compact status language"
            description="Use a small set of readable states so the product feels consistent instead of technical or overly operational."
          >
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="active" />
              <StatusBadge status="ready" />
              <StatusBadge status="warning" />
              <StatusBadge status="building" />
              <StatusBadge status="draft" />
              <StatusBadge status="error" />
            </div>
          </SectionCard>

          <PrimaryActionBar
            sticky
            title="Keep the main next step obvious"
            description="The primary action bar should feel like the final confirmation surface for important moments in the workflow."
            meta={<StatusBadge label="Ready for review" status="ready" />}
            tertiaryAction={<Button variant="ghost">Preview summary</Button>}
            secondaryAction={<Button variant="outline">Save draft</Button>}
            primaryAction={<Button>Generate installer</Button>}
          />
        </div>
      </AppShell>
    </div>
  );
}