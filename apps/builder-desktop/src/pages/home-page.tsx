import { ArrowRight, Clock3, Github, Link2, Package2, SearchCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { projectHistory } from "@/data/project-history";
import type { AnalyzeNavigationState } from "@/lib/source-navigation";
import { getBlockingSourceMessages, isDockerHubSource, parseSourceInput, type ParseSourceResult } from "@/lib/source-input";
import type { StatusTone } from "@/lib/status";
import { cn } from "@/lib/utils";

type SourceTab = "dockerHub" | "github";

interface SourceExample {
  description: string;
  label: string;
  value: string;
}

const sourceExamples: Record<SourceTab, SourceExample[]> = {
  dockerHub: [
    {
      description: "A familiar official image reference.",
      label: "nginx:latest",
      value: "nginx:latest",
    },
    {
      description: "A full Docker Hub repository page.",
      label: "Docker Hub page",
      value: "https://hub.docker.com/r/library/nginx",
    },
    {
      description: "A namespaced image with a pinned tag.",
      label: "Team image",
      value: "acme/notes-desktop:1.4.0",
    },
  ],
  github: [
    {
      description: "A repository URL on the default branch.",
      label: "Repository URL",
      value: "https://github.com/octocat/Hello-World",
    },
    {
      description: "A branch-aware GitHub URL.",
      label: "Branch URL",
      value: "https://github.com/octocat/Hello-World/tree/main",
    },
    {
      description: "A repo URL with an explicit ref query.",
      label: "Ref query",
      value: "https://github.com/octocat/Hello-World?ref=release/v1",
    },
  ],
};

const sourcePlaceholders: Record<SourceTab, string> = {
  dockerHub: "Paste a Docker Hub link or image reference like nginx:latest",
  github: "Paste a GitHub repository URL, branch URL, or repo link with ?ref=",
};

export function HomePage() {
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<SourceTab>("dockerHub");
  const [sourceInput, setSourceInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const trimmedSourceInput = sourceInput.trim();
  const parseResult = useMemo(() => parseSourceInput(sourceInput), [sourceInput]);
  const blockingMessages = getBlockingSourceMessages(parseResult.messages);
  const showValidation = hasInteracted || trimmedSourceInput.length > 0;
  const status = getValidationStatus(parseResult, showValidation);
  const crossTabHint = getCrossTabHint(sourceType, parseResult, showValidation);
  const canAnalyze = trimmedSourceInput.length > 0 && parseResult.ok && blockingMessages.length === 0;

  const handleExampleSelect = (nextSourceType: SourceTab, value: string) => {
    setSourceType(nextSourceType);
    setSourceInput(value);
    setHasInteracted(true);
  };

  const handleAnalyzeSource = () => {
    setHasInteracted(true);

    if (!canAnalyze || !parseResult.ok) {
      return;
    }

    const navigationState: AnalyzeNavigationState = {
      sourceInput: trimmedSourceInput,
      sourceType: isDockerHubSource(parseResult.source) ? "dockerHub" : "github",
    };

    navigate("/analyze", { state: navigationState });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <AppCard
        action={<StatusBadge label={status.label} status={status.status} />}
        className="border-primary/15 bg-[radial-gradient(circle_at_top_left,rgba(221,107,32,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_32%)]"
        contentClassName="space-y-8"
        description="Paste what you have and DockPack will help you tidy it into a source we can analyze with confidence."
        eyebrow="Friendly Start"
        title="Bring a Docker Hub or GitHub source into DockPack"
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label="Large paste target" status="ready" />
          <StatusBadge label="Inline validation" status="active" />
          <StatusBadge label="Example links included" status="draft" />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7">
            <div className="space-y-4">
              <div className="inline-flex rounded-[24px] border border-border/70 bg-background/80 p-1.5 shadow-panel">
                {(["dockerHub", "github"] as const).map((tab) => {
                  const isActive = sourceType === tab;

                  return (
                    <button
                      key={tab}
                      className={cn(
                        "inline-flex min-w-[168px] items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
                      )}
                      onClick={() => setSourceType(tab)}
                      type="button"
                    >
                      {tab === "dockerHub" ? <Package2 className="h-4 w-4" /> : <Github className="h-4 w-4" />}
                      {tab === "dockerHub" ? "Docker Hub" : "GitHub"}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <Label htmlFor="home-source-input">Source link or image reference</Label>
                <Textarea
                  className="min-h-[220px] rounded-[28px] px-5 py-4 text-base leading-7 shadow-panel"
                  id="home-source-input"
                  onChange={(event) => {
                    setSourceInput(event.target.value);
                    setHasInteracted(true);
                  }}
                  placeholder={sourcePlaceholders[sourceType]}
                  value={sourceInput}
                />
                <p className="text-sm leading-6 text-muted-foreground">
                  Full Docker Hub links, image references like <span className="font-medium text-foreground">nginx:latest</span>,
                  GitHub repository URLs, and GitHub branch or ref links are all welcome here.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Example links
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {sourceExamples[sourceType].map((example) => (
                    <button
                      key={`${sourceType}-${example.label}`}
                      className="rounded-[24px] border border-border/60 bg-background/78 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-background"
                      onClick={() => handleExampleSelect(sourceType, example.value)}
                      type="button"
                    >
                      <p className="text-sm font-semibold text-foreground">{example.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{example.description}</p>
                      <p className="mt-3 line-clamp-2 text-xs font-medium text-primary">{example.value}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-background/80 p-5 shadow-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Validation</p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{status.title}</h3>
                </div>
                <StatusBadge label={status.label} status={status.status} />
              </div>

              <div className="mt-5 space-y-3">
                {!showValidation ? (
                  <div className="rounded-[22px] border border-border/60 bg-muted/45 px-4 py-4 text-sm leading-6 text-muted-foreground">
                    Paste whatever you have when you are ready. DockPack will validate it gently, explain any issues in plain
                    language, and keep the next step feeling approachable.
                  </div>
                ) : null}

                {showValidation && parseResult.messages.map((message, index) => (
                  <div
                    key={`${message.code}-${index}`}
                    className={cn(
                      "rounded-[22px] border px-4 py-4",
                      message.severity === "error"
                        ? "border-danger/25 bg-danger/10 text-danger"
                        : "border-warning/25 bg-warning/10 text-warning",
                    )}
                  >
                    <p className="text-sm font-semibold">{message.message}</p>
                    {message.suggestion ? <p className="mt-1 text-sm leading-6 text-current/85">{message.suggestion}</p> : null}
                  </div>
                ))}

                {crossTabHint ? (
                  <div className="rounded-[22px] border border-warning/25 bg-warning/10 px-4 py-4 text-warning">
                    <p className="text-sm font-semibold">{crossTabHint.title}</p>
                    <p className="mt-1 text-sm leading-6 text-current/85">{crossTabHint.description}</p>
                  </div>
                ) : null}

                {showValidation && parseResult.ok ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-success/25 bg-success/10 p-4 text-success">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em]">Detected source</p>
                      <p className="mt-3 text-base font-semibold">{getDetectedSourceLabel(parseResult)}</p>
                      <p className="mt-2 text-sm leading-6 text-current/85">{parseResult.source.displayName}</p>
                    </div>

                    <div className="rounded-[22px] border border-border/60 bg-background/90 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">What DockPack will analyze</p>
                      <p className="mt-3 text-base font-semibold text-foreground">{getNormalizedTitle(parseResult)}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{getNormalizedSummary(parseResult)}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button className="min-w-[220px]" onClick={handleAnalyzeSource} size="lg">
                Analyze Source
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Nothing complicated happens yet. We will validate the source first, confirm the one-container fit, and then
                carry you into the setup flow with helpful defaults.
              </p>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="rounded-[28px] border border-border/60 bg-background/84 p-6 shadow-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                  <SearchCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">A gentle first step</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    You do not need the perfect link format up front. DockPack will normalize it for you whenever it can.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-background/84 p-6 shadow-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-success/12 p-3 text-success">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Helpful normalization</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Official Docker images, Docker Hub repository pages, GitHub repos, and refs all flow into one clean schema.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-background/84 p-6 shadow-panel">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-warning/12 p-3 text-warning">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Friendly feedback</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    When something needs attention, DockPack explains what happened, why it matters, and what to try next.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label={`${projectHistory.length} saved`} status="draft" />}
          description="Jump back into recent packaging work without hunting for the right project or remembering which source you used."
          eyebrow="Recent Projects"
          title="Pick up where you left off"
        >
          <div className="space-y-4">
            {projectHistory.map((project, index) => (
              <div key={project.id}>
                <div className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-background/80 p-5 transition-all duration-200 hover:border-primary/20 hover:bg-background">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">{project.summary}</p>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Source</p>
                      <p className="mt-2 text-foreground">{project.sourceType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Version</p>
                      <p className="mt-2 text-foreground">{project.version}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Updated</p>
                      <p className="mt-2 text-foreground">{project.updatedAt}</p>
                    </div>
                  </div>
                </div>

                {index < projectHistory.length - 1 ? <Separator className="my-4 bg-transparent" /> : null}
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard
          description="DockPack keeps the opening experience warm and honest so builders feel supported before any heavy lifting begins."
          eyebrow="What Happens Next"
          title="After you click Analyze Source"
        >
          <div className="space-y-3">
            {[
              "We validate the pasted source and normalize it into a stable descriptor.",
              "We check whether the project still fits the one-container DockPack MVP.",
              "We carry the cleaned source into the analysis screen so you can keep moving.",
            ].map((step) => (
              <div key={step} className="rounded-[22px] border border-border/60 bg-background/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                {step}
              </div>
            ))}
          </div>
        </AppCard>
      </div>
    </div>
  );
}

function getValidationStatus(parseResult: ParseSourceResult, showValidation: boolean): {
  label: string;
  status: StatusTone;
  title: string;
} {
  if (!showValidation) {
    return {
      label: "Ready when you are",
      status: "draft",
      title: "A calm place to start",
    };
  }

  const blockingMessages = getBlockingSourceMessages(parseResult.messages);

  if (!parseResult.ok || blockingMessages.length > 0) {
    return {
      label: "Needs a quick fix",
      status: "error",
      title: "A couple of details need attention first",
    };
  }

  if (parseResult.messages.length > 0) {
    return {
      label: "Looks good with notes",
      status: "warning",
      title: "DockPack can work with this input",
    };
  }

  return {
    label: "Ready to analyze",
    status: "ready",
    title: "This source looks great",
  };
}

function getCrossTabHint(sourceType: SourceTab, parseResult: ParseSourceResult, showValidation: boolean): {
  description: string;
  title: string;
} | undefined {
  if (!showValidation || !parseResult.ok) {
    return undefined;
  }

  if (sourceType === "dockerHub" && !isDockerHubSource(parseResult.source)) {
    return {
      description: "Your pasted input looks like GitHub, which is perfectly fine. Switch tabs if you want GitHub-specific examples, or keep going as-is.",
      title: "This looks like a GitHub repository",
    };
  }

  if (sourceType === "github" && isDockerHubSource(parseResult.source)) {
    return {
      description: "Your pasted input looks like Docker Hub, which DockPack can still analyze. Switch tabs if you want Docker-focused example links.",
      title: "This looks like a Docker Hub source",
    };
  }

  return undefined;
}

function getDetectedSourceLabel(parseResult: ParseSourceResult): string {
  if (!parseResult.ok) {
    return "Unsupported input";
  }

  return isDockerHubSource(parseResult.source) ? "Docker Hub image source" : "GitHub repository source";
}

function getNormalizedTitle(parseResult: ParseSourceResult): string {
  if (!parseResult.ok) {
    return "Waiting for a supported source";
  }

  return isDockerHubSource(parseResult.source) ? "Canonical Docker reference" : "Canonical GitHub repository";
}

function getNormalizedSummary(parseResult: ParseSourceResult): string {
  if (!parseResult.ok) {
    return "Paste a supported source and DockPack will convert it into the normalized shape used by analysis.";
  }

  if (isDockerHubSource(parseResult.source)) {
    return `${parseResult.source.canonicalReference} will be used as the stable Docker Hub reference for analysis.`;
  }

  return parseResult.source.ref
    ? `${parseResult.source.repositoryUrl} with ref ${parseResult.source.ref.value} will be carried into analysis.`
    : `${parseResult.source.repositoryUrl} will be analyzed on its default branch until you provide a ref.`;
}
