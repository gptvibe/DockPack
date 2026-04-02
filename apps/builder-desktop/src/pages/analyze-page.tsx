import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { AppCard } from "@/components/shared/app-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper, type StepItem } from "@/components/shared/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnalyzeNavigationState } from "@/lib/source-navigation";
import {
  getBlockingSourceMessages,
  isDockerHubSource,
  isGitHubSource,
  parseSourceInput,
  type ParseSourceResult,
  type SourceMessage,
} from "@/lib/source-input";
import type { StatusTone } from "@/lib/status";
import { cn } from "@/lib/utils";

const sourceExamples = {
  dockerHub: "https://hub.docker.com/r/acme/notes-desktop",
  github: "https://github.com/octocat/Hello-World?ref=main",
} as const;

export function AnalyzePage() {
  const location = useLocation();
  const navigationState = (location.state ?? null) as AnalyzeNavigationState | null;
  const initialSourceType = navigationState?.sourceType === "github" ? "github" : "dockerHub";
  const initialSourceUrl = navigationState?.sourceInput?.trim() ? navigationState.sourceInput.trim() : sourceExamples[initialSourceType];
  const [sourceType, setSourceType] = useState<"dockerHub" | "github">(initialSourceType);
  const [sourceUrl, setSourceUrl] = useState<string>(initialSourceUrl);
  const [notes, setNotes] = useState(
    "Target a single HTTP port, preserve a clean first-run experience, and keep all runtime messaging beginner-friendly.",
  );

  const parseResult = useMemo(() => parseSourceInput(sourceUrl), [sourceUrl]);
  const blockingMessages = getBlockingSourceMessages(parseResult.messages);
  const nonBlockingMessages = parseResult.messages.filter((message) => message.severity !== "error");
  const sourceStatus = getSourceStatus(parseResult);
  const analysisSteps = getAnalysisSteps(parseResult);
  const normalizedDetails = getNormalizedDetails(parseResult);
  const detectedInputLabel = getDetectedInputLabel(parseResult);

  const handleSourceTypeSelect = (nextSourceType: "dockerHub" | "github") => {
    setSourceType(nextSourceType);
    setSourceUrl((currentValue) => {
      const normalizedCurrentValue = currentValue.trim();

      if (!normalizedCurrentValue || Object.values(sourceExamples).includes(normalizedCurrentValue as (typeof sourceExamples)[keyof typeof sourceExamples])) {
        return sourceExamples[nextSourceType];
      }

      return currentValue;
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <AppCard
        action={<StatusBadge label={sourceStatus.label} status={sourceStatus.status} />}
        description="Paste a Docker Hub image, a Docker Hub repository page, or a GitHub repository URL and let DockPack normalize it before deeper analysis begins."
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
              onClick={() => handleSourceTypeSelect("dockerHub")}
              type="button"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Option A</p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">Docker Hub image</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Accepts Docker Hub page links and image references like <span className="font-medium text-foreground">nginx:latest</span>.
              </p>
            </button>

            <button
              className={cn(
                "rounded-[24px] border p-5 text-left transition-all duration-200",
                sourceType === "github"
                  ? "border-primary/30 bg-primary/10 shadow-panel"
                  : "border-border/60 bg-background/75 hover:border-primary/20",
              )}
              onClick={() => handleSourceTypeSelect("github")}
              type="button"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Option B</p>
              <h3 className="mt-3 text-lg font-semibold text-foreground">GitHub repository</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Accepts repository URLs and keeps an exact ref when the pasted link exposes one safely.
              </p>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="source-url">Source input</Label>
              <Input
                id="source-url"
                onChange={(event) => setSourceUrl(event.target.value)}
                placeholder={sourceType === "dockerHub" ? "nginx:latest" : "https://github.com/owner/repo?ref=main"}
                value={sourceUrl}
              />
              <p className="text-sm leading-6 text-muted-foreground">
                {sourceType === "dockerHub"
                  ? "Examples: `nginx:latest`, `library/nginx`, or `https://hub.docker.com/r/library/nginx`."
                  : "Examples: `https://github.com/owner/repo`, `https://github.com/owner/repo/tree/main`, or `https://github.com/owner/repo?ref=release/v1`."}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Input feedback</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    DockPack returns actionable errors for blocking issues and warnings for inputs that still need a closer look.
                  </p>
                </div>
                <StatusBadge label={sourceStatus.label} status={sourceStatus.status} />
              </div>

              <div className="mt-5 space-y-3">
                {parseResult.messages.length > 0 ? (
                  parseResult.messages.map((message, index) => (
                    <div
                      key={`${message.code}-${index}`}
                      className={cn(
                        "rounded-[20px] border px-4 py-3",
                        message.severity === "error"
                          ? "border-danger/25 bg-danger/10 text-danger"
                          : "border-warning/25 bg-warning/10 text-warning",
                      )}
                    >
                      <p className="text-sm font-semibold">{message.message}</p>
                      {message.suggestion ? (
                        <p className="mt-1 text-sm leading-6 text-current/80">{message.suggestion}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-success/25 bg-success/10 px-4 py-3 text-success">
                    <p className="text-sm font-semibold">Input parsing passed cleanly.</p>
                    <p className="mt-1 text-sm leading-6 text-current/80">
                      The source is normalized and ready for compatibility checks.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="analysis-notes">Builder notes</Label>
              <Textarea id="analysis-notes" onChange={(event) => setNotes(event.target.value)} value={notes} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button disabled={blockingMessages.length > 0} size="lg">Run analysis</Button>
            <Button size="lg" variant="outline">Save draft</Button>
          </div>
        </div>
      </AppCard>

      <div className="grid gap-6">
        <AppCard
          action={<StatusBadge label={sourceStatus.badge} status={sourceStatus.status} />}
          description="This preview now reflects the real parser output instead of a static mock verdict, including normalized references and safe ref extraction."
          eyebrow="Compatibility Snapshot"
          title="Parser preview"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Detected input</p>
              <p className="mt-3 text-base font-semibold text-foreground">{detectedInputLabel}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {parseResult.ok ? parseResult.source.displayName : blockingMessages[0]?.message ?? "Paste a supported source to continue."}
              </p>
            </div>

            <div className="rounded-[24px] border border-border/60 bg-background/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Normalized source</p>
              <p className="mt-3 text-base font-semibold text-foreground">{normalizedDetails.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{normalizedDetails.summary}</p>
            </div>
          </div>

          {parseResult.ok && nonBlockingMessages.length > 0 ? (
            <div className="mt-4 rounded-[24px] border border-warning/25 bg-warning/10 p-5 text-warning">
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Notes for analysis</p>
              <div className="mt-3 space-y-2">
                {nonBlockingMessages.map((message, index) => (
                  <p key={`${message.code}-${index}`} className="text-sm leading-6 text-current/85">
                    {message.message}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </AppCard>

        <AppCard
          description="A reusable stepper keeps every route aligned with the same guided product language, while the first step now reflects real parsing status."
          eyebrow="Analysis Flow"
          title="What the next checks should surface"
        >
          <Stepper steps={analysisSteps} />
        </AppCard>
      </div>
    </div>
  );
}

function getSourceStatus(parseResult: ParseSourceResult): {
  badge: string;
  label: string;
  status: StatusTone;
} {
  const blockingMessages = getBlockingSourceMessages(parseResult.messages);

  if (!parseResult.ok || blockingMessages.length > 0) {
    return {
      badge: "Needs correction",
      label: "Input blocked",
      status: "error",
    };
  }

  if (parseResult.messages.length > 0) {
    return {
      badge: "Supported with notes",
      label: "Review notes",
      status: "warning",
    };
  }

  return {
    badge: "Input ready",
    label: "Ready to analyze",
    status: "ready",
  };
}

function getAnalysisSteps(parseResult: ParseSourceResult): StepItem[] {
  const inputDescription = parseResult.ok
    ? `DockPack normalized the source as ${parseResult.source.displayName} and can now hand off a stable descriptor to deeper analysis.`
    : "Normalize the pasted input, determine whether it is Docker Hub or GitHub, and block unsupported patterns early.";

  return [
    {
      description: inputDescription,
      id: "validate-input",
      status: parseResult.ok ? "complete" : "current",
      title: "Validate the pasted source",
    },
    {
      description: "Confirm the source maps to a single-container app and highlight unsupported multi-service assumptions.",
      id: "single-container",
      status: parseResult.ok ? "current" : "upcoming",
      title: "Check one-container viability",
    },
    {
      description: "Collect image or repository hints so the packaging screen can start with strong defaults instead of a blank form.",
      id: "infer-defaults",
      status: "upcoming",
      title: "Infer packaging defaults",
    },
  ];
}

function getDetectedInputLabel(parseResult: ParseSourceResult): string {
  if (!parseResult.ok) {
    return "Unsupported or incomplete input";
  }

  return isDockerHubSource(parseResult.source) ? "Docker Hub image source" : "GitHub repository source";
}

function getNormalizedDetails(parseResult: ParseSourceResult): { summary: string; title: string } {
  if (!parseResult.ok) {
    const firstBlockingMessage = getBlockingSourceMessages(parseResult.messages)[0];

    return {
      summary: firstBlockingMessage?.suggestion ?? "Paste a supported source and DockPack will convert it into a normalized descriptor.",
      title: "Waiting for a supported source",
    };
  }

  if (isDockerHubSource(parseResult.source)) {
    return {
      summary: `${parseResult.source.canonicalReference} points to ${parseResult.source.repositoryUrl}. ${
        parseResult.source.reference.explicit
          ? "The tag or digest was preserved exactly."
          : "No tag was supplied, so DockPack normalized the reference to `latest`."
      }`,
      title: "Canonical Docker Hub reference",
    };
  }

  if (isGitHubSource(parseResult.source) && parseResult.source.ref) {
    return {
      summary: `${parseResult.source.repositoryUrl} with ref ${parseResult.source.ref.value}${
        parseResult.source.ref.exact ? "" : " (review suggested)"
      }.`,
      title: "Canonical GitHub repository",
    };
  }

  return {
    summary: `${parseResult.source.repositoryUrl} will use the default branch unless you provide a ref.`,
    title: "Canonical GitHub repository",
  };
}
