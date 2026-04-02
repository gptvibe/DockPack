export type CommandExecutionMode = "live" | "simulated";

export interface CommandExecution {
  operationId: string;
  mode: CommandExecutionMode;
  startedAtMs: number;
  completedAtMs: number;
}

export interface CommandWarning {
  code: string;
  message: string;
}

export interface ParseSourceRequest {
  input: string;
}

export interface ParseSourceCommandResult {
  execution: CommandExecution;
  source: SourceDescriptor;
  warnings: CommandWarning[];
}

export type SourceDescriptor = DockerHubSourceDescriptor | GitHubSourceDescriptor;

export interface DockerHubSourceDescriptor {
  kind: "docker-hub";
  rawInput: string;
  normalizedInput: string;
  canonicalReference: string;
  displayName: string;
  repositoryUrl: string;
  repository: DockerHubRepositoryDescriptor;
  reference: ImageReferenceDescriptor;
}

export interface DockerHubRepositoryDescriptor {
  fullName: string;
  isOfficial: boolean;
  namespace: string;
  repository: string;
  registry: string;
}

export interface ImageReferenceDescriptor {
  type: ImageReferenceType;
  value: string;
  explicit: boolean;
}

export type ImageReferenceType = "default-tag" | "tag" | "digest";

export interface GitHubSourceDescriptor {
  kind: "github";
  rawInput: string;
  normalizedInput: string;
  displayName: string;
  repositoryUrl: string;
  cloneUrl: string;
  owner: string;
  repo: string;
  gitRef?: GitRefDescriptor | null;
}

export interface GitRefDescriptor {
  type: GitRefType;
  source: GitRefSource;
  value: string;
  exact: boolean;
}

export type GitRefType = "branch" | "commit" | "tag" | "unknown";
export type GitRefSource = "archive" | "commit" | "path" | "query" | "release";

export interface InspectRuntimeRequest {
  preferredRuntime?: RuntimeKind | null;
  includeDiagnostics: boolean;
}

export interface InspectRuntimeCommandResult {
  execution: CommandExecution;
  runtimes: RuntimeInstallation[];
  preferredRuntime?: RuntimeKind | null;
  warnings: CommandWarning[];
}

export interface RuntimeInstallation {
  kind: RuntimeKind;
  available: boolean;
  version?: string | null;
  binaryPath?: string | null;
  daemonReachable: boolean;
  checks: RuntimeCheck[];
}

export interface RuntimeCheck {
  code: string;
  label: string;
  status: RuntimeCheckStatus;
  detail: string;
  action?: string | null;
}

export type RuntimeKind = "docker" | "podman";
export type RuntimeCheckStatus = "pass" | "warn" | "fail" | "skipped";

export interface PullImageRequest {
  imageReference: string;
  platform?: string | null;
  allowCached: boolean;
}

export interface PullImageCommandResult {
  execution: CommandExecution;
  imageReference: string;
  resolvedReference: string;
  imageId: string;
  digest?: string | null;
  cached: boolean;
  layersDownloaded: number;
  warnings: CommandWarning[];
}

export interface BuildImageFromGitRequest {
  repositoryUrl: string;
  gitRef?: string | null;
  imageTag: string;
  contextPath?: string | null;
  dockerfilePath?: string | null;
}

export interface BuildImageFromGitCommandResult {
  execution: CommandExecution;
  repositoryUrl: string;
  gitRef?: string | null;
  imageTag: string;
  imageId: string;
  buildContext: string;
  dockerfilePath: string;
  warnings: CommandWarning[];
}

export interface InspectImageRequest {
  imageReference: string;
}

export interface InspectImageCommandResult {
  execution: CommandExecution;
  imageReference: string;
  imageId: string;
  digest?: string | null;
  architecture: string;
  os: string;
  workingDir?: string | null;
  entrypoint: string[];
  cmd: string[];
  exposedPorts: string[];
  environment: ImageEnvironmentVariable[];
  labels: Record<string, string>;
  warnings: CommandWarning[];
}

export interface ImageEnvironmentVariable {
  name: string;
  value: string;
}

export interface StreamLogsRequest {
  source: LogStreamSource;
  tail?: number | null;
  follow: boolean;
}

export type LogStreamSource =
  | { kind: "runtime"; runtime?: RuntimeKind | null }
  | { kind: "image-pull"; operationId?: string | null; imageReference: string }
  | { kind: "git-build"; operationId?: string | null; repositoryUrl: string; imageTag: string }
  | { kind: "image-inspection"; imageReference: string };

export interface StreamLogsCommandResult {
  execution: CommandExecution;
  streamId: string;
  eventName: string;
  source: LogStreamSource;
  tail: number;
  follow: boolean;
}

export interface LogStreamEvent {
  streamId: string;
  sequence: number;
  entry: LogEntry;
  done: boolean;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestampMs: number;
  source: string;
}

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export const DOCKPACK_LOG_STREAM_EVENT = "dockpack://log-stream";
