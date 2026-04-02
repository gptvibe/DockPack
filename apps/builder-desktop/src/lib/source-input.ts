export type SourceKind = "docker-hub" | "github";
export type SourceMessageSeverity = "error" | "warning";
export type SourceMessageCode =
  | "ambiguous-github-ref"
  | "empty-input"
  | "invalid-docker-digest"
  | "invalid-docker-hub-url"
  | "invalid-docker-name"
  | "invalid-docker-reference"
  | "invalid-docker-tag"
  | "invalid-github-owner"
  | "invalid-github-repository"
  | "invalid-github-url"
  | "invalid-source-url"
  | "unsupported-docker-registry"
  | "unsupported-source";

export interface SourceMessage {
  code: SourceMessageCode;
  message: string;
  severity: SourceMessageSeverity;
  suggestion?: string;
}

export interface DockerHubRepositoryDescriptor {
  fullName: string;
  isOfficial: boolean;
  namespace: string;
  registry: "docker.io";
  repository: string;
}

export interface DockerHubReferenceDescriptor {
  explicit: boolean;
  type: "default-tag" | "digest" | "tag";
  value: string;
}

export interface NormalizedDockerHubSource {
  canonicalReference: string;
  displayName: string;
  kind: "docker-hub";
  normalizedInput: string;
  rawInput: string;
  reference: DockerHubReferenceDescriptor;
  repository: DockerHubRepositoryDescriptor;
  repositoryUrl: string;
}

export interface GitHubRefDescriptor {
  exact: boolean;
  source: "archive" | "commit" | "path" | "query" | "release";
  type: "branch" | "commit" | "tag" | "unknown";
  value: string;
}

export interface NormalizedGitHubSource {
  cloneUrl: string;
  displayName: string;
  kind: "github";
  normalizedInput: string;
  owner: string;
  rawInput: string;
  ref?: GitHubRefDescriptor;
  repo: string;
  repositoryUrl: string;
  subpath?: string;
}

export type NormalizedSource = NormalizedDockerHubSource | NormalizedGitHubSource;

export interface ParseSourceSuccess {
  messages: SourceMessage[];
  ok: true;
  source: NormalizedSource;
}

export interface ParseSourceFailure {
  input: string;
  messages: SourceMessage[];
  ok: false;
}

export type ParseSourceResult = ParseSourceFailure | ParseSourceSuccess;

const DOCKER_HUB_REGISTRY_HOSTS = new Set(["docker.io", "index.docker.io", "registry-1.docker.io"]);
const DOCKER_HUB_URL_HOSTS = new Set(["hub.docker.com", "www.hub.docker.com", "registry.hub.docker.com"]);
const GITHUB_URL_HOSTS = new Set(["github.com", "www.github.com"]);

const DOCKER_NAME_COMPONENT_PATTERN = /^[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*$/;
const DOCKER_TAG_PATTERN = /^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$/;
const DOCKER_DIGEST_PATTERN = /^[A-Za-z][A-Za-z0-9+._-]*:[0-9a-fA-F]{32,}$/;
const GITHUB_SEGMENT_PATTERN = /^[A-Za-z0-9_.-]+$/;
const HTTP_URL_PATTERN = /^[A-Za-z][A-Za-z0-9+.-]*:\/\//;
const GITHUB_SHORT_URL_PATTERN = /^(?:www\.)?github\.com(?:\/|$)/i;
const DOCKER_HUB_SHORT_URL_PATTERN = /^(?:(?:www|registry)\.)?hub\.docker\.com(?:\/|$)/i;

export function parseSourceInput(input: string): ParseSourceResult {
  const rawInput = input.trim();

  if (!rawInput) {
    return fail(rawInput, [
      error(
        "empty-input",
        "Paste a Docker Hub image, a Docker Hub repository link, or a GitHub repository URL to continue.",
        "Try values like `nginx:latest`, `https://hub.docker.com/r/library/nginx`, or `https://github.com/octocat/Hello-World`.",
      ),
    ]);
  }

  const urlCandidate = coerceWebUrl(rawInput);

  if (urlCandidate) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(urlCandidate);
    } catch {
      return fail(rawInput, [
        error(
          "invalid-source-url",
          "That link could not be parsed as a valid web URL.",
          "Check for missing slashes or unexpected characters, then try again.",
        ),
      ]);
    }

    return parseUrlSource(rawInput, parsedUrl);
  }

  return parseDockerImageReference(rawInput);
}

export function validateSourceInput(input: string): SourceMessage[] {
  return parseSourceInput(input).messages;
}

export function validateParsedSource(source: NormalizedSource): SourceMessage[] {
  if (source.kind === "docker-hub") {
    const messages: SourceMessage[] = [];
    const { namespace, repository } = source.repository;

    if (!DOCKER_NAME_COMPONENT_PATTERN.test(namespace)) {
      messages.push(
        error(
          "invalid-docker-name",
          `Docker Hub namespace \`${namespace}\` is not valid.`,
          "Use lowercase letters, numbers, and simple separators like `-`, `_`, or `.`.",
        ),
      );
    }

    if (!DOCKER_NAME_COMPONENT_PATTERN.test(repository)) {
      messages.push(
        error(
          "invalid-docker-name",
          `Docker Hub repository \`${repository}\` is not valid.`,
          "Use lowercase letters, numbers, and simple separators like `-`, `_`, or `.`.",
        ),
      );
    }

    if (source.reference.type === "tag" && !DOCKER_TAG_PATTERN.test(source.reference.value)) {
      messages.push(
        error(
          "invalid-docker-tag",
          `Docker tag \`${source.reference.value}\` is not valid.`,
          "Use a tag like `latest`, `1.27`, or `2026-03-31`.",
        ),
      );
    }

    if (source.reference.type === "digest" && !DOCKER_DIGEST_PATTERN.test(source.reference.value)) {
      messages.push(
        error(
          "invalid-docker-digest",
          `Docker digest \`${source.reference.value}\` is not valid.`,
          "Use a digest like `sha256:...` with the full hex value.",
        ),
      );
    }

    return messages;
  }

  const messages: SourceMessage[] = [];

  if (!GITHUB_SEGMENT_PATTERN.test(source.owner)) {
    messages.push(
      error(
        "invalid-github-owner",
        `GitHub owner \`${source.owner}\` is not valid.`,
        "Paste a repository URL like `https://github.com/owner/repo`.",
      ),
    );
  }

  if (!GITHUB_SEGMENT_PATTERN.test(source.repo)) {
    messages.push(
      error(
        "invalid-github-repository",
        `GitHub repository \`${source.repo}\` is not valid.`,
        "Paste a repository URL like `https://github.com/owner/repo`.",
      ),
    );
  }

  if (source.ref && !source.ref.value.trim()) {
    messages.push(
      error(
        "invalid-github-url",
        "The GitHub URL included a ref marker, but the ref itself was empty.",
        "Paste the repository URL again or include a ref like `?ref=main`.",
      ),
    );
  }

  return messages;
}

export function getBlockingSourceMessages(messages: SourceMessage[]): SourceMessage[] {
  return messages.filter((message) => message.severity === "error");
}

export function hasBlockingSourceMessages(messages: SourceMessage[]): boolean {
  return getBlockingSourceMessages(messages).length > 0;
}

export function isDockerHubSource(source: NormalizedSource): source is NormalizedDockerHubSource {
  return source.kind === "docker-hub";
}

export function isGitHubSource(source: NormalizedSource): source is NormalizedGitHubSource {
  return source.kind === "github";
}

function parseUrlSource(rawInput: string, url: URL): ParseSourceResult {
  const protocol = url.protocol.toLowerCase();

  if (protocol !== "http:" && protocol !== "https:") {
    return fail(rawInput, [
      error(
        "invalid-source-url",
        "DockPack expects a regular HTTP or HTTPS link for GitHub and Docker Hub sources.",
        "Paste the page URL from your browser rather than a custom protocol link.",
      ),
    ]);
  }

  const host = url.hostname.toLowerCase();

  if (GITHUB_URL_HOSTS.has(host)) {
    return parseGitHubUrl(rawInput, url);
  }

  if (host === "raw.githubusercontent.com" || host === "gist.github.com") {
    return fail(rawInput, [
      error(
        "invalid-github-url",
        "That GitHub link points to a file or gist, not a repository page DockPack can analyze.",
        "Paste the main repository URL instead, such as `https://github.com/owner/repo`.",
      ),
    ]);
  }

  if (DOCKER_HUB_URL_HOSTS.has(host)) {
    return parseDockerHubUrl(rawInput, url);
  }

  return fail(rawInput, [
    error(
      "unsupported-source",
      "DockPack currently supports Docker Hub sources and GitHub repository URLs only.",
      "Try a Docker Hub image, a Docker Hub repository page, or a GitHub repository link.",
    ),
  ]);
}

function parseDockerImageReference(rawInput: string): ParseSourceResult {
  if (/\s/.test(rawInput)) {
    return fail(rawInput, [
      error(
        "invalid-docker-reference",
        "Docker image references cannot contain spaces.",
        "Use a reference like `nginx:latest` or `acme/notes-desktop:1.4.0`.",
      ),
    ]);
  }

  const digestSplit = rawInput.split("@");

  if (digestSplit.length > 2) {
    return fail(rawInput, [
      error(
        "invalid-docker-reference",
        "That Docker image reference includes more than one digest marker.",
        "Keep a single digest suffix such as `@sha256:...`.",
      ),
    ]);
  }

  const digest = digestSplit[1];
  const namePortion = digestSplit[0];
  const nameSegments = namePortion.split("/");

  if (digestSplit.length === 2 && !digest) {
    return fail(rawInput, [
      error(
        "invalid-docker-digest",
        "That Docker image reference ends with `@`, but the digest is missing.",
        "Add a full digest like `@sha256:...` or remove the `@` marker.",
      ),
    ]);
  }

  if (!namePortion || nameSegments.some((segment) => segment.length === 0)) {
    return fail(rawInput, [
      error(
        "invalid-docker-reference",
        "That Docker image reference is missing part of the repository name.",
        "Use a Docker Hub image like `nginx`, `nginx:latest`, or `namespace/app:1.0.0`.",
      ),
    ]);
  }

  let registryHost = "docker.io";
  let pathSegments = [...nameSegments];

  if (nameSegments.length > 1 && isRegistryHost(nameSegments[0])) {
    registryHost = normalizeDockerRegistryHost(nameSegments[0]);
    pathSegments = nameSegments.slice(1);
  }

  if (!DOCKER_HUB_REGISTRY_HOSTS.has(registryHost)) {
    return fail(rawInput, [
      error(
        "unsupported-docker-registry",
        `DockPack only supports Docker Hub today, but \`${registryHost}\` was provided.`,
        "Paste the Docker Hub image reference instead, such as `namespace/app:tag`.",
      ),
    ]);
  }

  if (pathSegments.length === 0) {
    return fail(rawInput, [
      error(
        "invalid-docker-reference",
        "That Docker Hub reference is missing the repository name.",
        "Use a Docker Hub image like `nginx:latest` or `namespace/app:1.0.0`.",
      ),
    ]);
  }

  const lastSegment = pathSegments[pathSegments.length - 1];
  const tagSeparatorIndex = lastSegment.lastIndexOf(":");
  let tag: string | undefined;

  if (tagSeparatorIndex >= 0) {
    tag = lastSegment.slice(tagSeparatorIndex + 1);
    pathSegments[pathSegments.length - 1] = lastSegment.slice(0, tagSeparatorIndex);
  }

  if (tagSeparatorIndex >= 0 && !tag) {
    return fail(rawInput, [
      error(
        "invalid-docker-tag",
        "That Docker image reference ends with `:`, but the tag is missing.",
        "Add a tag like `:latest` or remove the trailing `:`.",
      ),
    ]);
  }

  let namespace: string;
  let repository: string;

  if (pathSegments.length === 1) {
    namespace = "library";
    repository = pathSegments[0];
  } else if (pathSegments.length === 2) {
    namespace = pathSegments[0];
    repository = pathSegments[1];
  } else {
    return fail(rawInput, [
      error(
        "invalid-docker-reference",
        "That Docker Hub image reference has too many path segments.",
        "Use an official image like `nginx` or a namespaced image like `namespace/app:tag`.",
      ),
    ]);
  }

  return finalizeSource(
    createDockerHubSource({
      digest,
      namespace,
      rawInput,
      repository,
      tag,
    }),
  );
}

function parseDockerHubUrl(rawInput: string, url: URL): ParseSourceResult {
  const pathSegments = getPathSegments(url);
  const extracted = extractDockerHubRepositoryFromUrl(pathSegments, url.searchParams);

  if (!extracted) {
    return fail(rawInput, [
      error(
        "invalid-docker-hub-url",
        "That Docker Hub link does not point to a repository page DockPack can analyze.",
        "Paste a repository URL like `https://hub.docker.com/r/library/nginx` or the image reference itself.",
      ),
    ]);
  }

  return finalizeSource(
    createDockerHubSource({
      namespace: extracted.namespace,
      rawInput,
      repository: extracted.repository,
      tag: extracted.tag,
    }),
  );
}

function parseGitHubUrl(rawInput: string, url: URL): ParseSourceResult {
  const pathSegments = getPathSegments(url);

  if (pathSegments.length < 2) {
    return fail(rawInput, [
      error(
        "invalid-github-url",
        "That GitHub link does not include both an owner and a repository name.",
        "Paste a repository URL like `https://github.com/owner/repo`.",
      ),
    ]);
  }

  const owner = pathSegments[0];
  const repo = stripGitSuffix(pathSegments[1]);

  const source = createGitHubSource({
    ...parseGitHubContext(pathSegments.slice(2), url.searchParams),
    owner,
    rawInput,
    repo,
  });

  return finalizeSource(source);
}

function finalizeSource(source: NormalizedSource): ParseSourceResult {
  const messages = source.kind === "github" && source.ref && !source.ref.exact
    ? [warning(
        "ambiguous-github-ref",
        `DockPack recognized ${source.owner}/${source.repo}, but the branch or ref could not be extracted with full confidence.`,
        "If you need a specific branch or tag, paste the repo URL with `?ref=...` or use a GitHub URL that ends directly at the ref.",
      ), ...validateParsedSource(source)]
    : validateParsedSource(source);

  if (hasBlockingSourceMessages(messages)) {
    return fail(source.rawInput, messages);
  }

  return {
    messages,
    ok: true,
    source,
  };
}

function createDockerHubSource(input: {
  digest?: string;
  namespace: string;
  rawInput: string;
  repository: string;
  tag?: string;
}): NormalizedDockerHubSource {
  const fullName = `${input.namespace}/${input.repository}`;
  const isOfficial = input.namespace === "library";
  const reference = input.digest
    ? {
        explicit: true,
        type: "digest" as const,
        value: input.digest,
      }
    : input.tag
      ? {
          explicit: true,
          type: "tag" as const,
          value: input.tag,
        }
      : {
          explicit: false,
          type: "default-tag" as const,
          value: "latest",
        };

  const canonicalReference = reference.type === "digest"
    ? `docker.io/${fullName}@${reference.value}`
    : `docker.io/${fullName}:${reference.value}`;

  return {
    canonicalReference,
    displayName: reference.type === "digest" ? `${fullName}@${reference.value}` : `${fullName}:${reference.value}`,
    kind: "docker-hub",
    normalizedInput: canonicalReference,
    rawInput: input.rawInput,
    reference,
    repository: {
      fullName,
      isOfficial,
      namespace: input.namespace,
      registry: "docker.io",
      repository: input.repository,
    },
    repositoryUrl: isOfficial
      ? `https://hub.docker.com/_/${input.repository}`
      : `https://hub.docker.com/r/${fullName}`,
  };
}

function createGitHubSource(input: {
  owner: string;
  rawInput: string;
  ref?: GitHubRefDescriptor;
  repo: string;
  subpath?: string;
}): NormalizedGitHubSource {
  const repositoryUrl = `https://github.com/${input.owner}/${input.repo}`;
  const normalizedInput = input.ref
    ? `${repositoryUrl}?ref=${encodeURIComponent(input.ref.value)}`
    : repositoryUrl;

  return {
    cloneUrl: `${repositoryUrl}.git`,
    displayName: input.ref ? `${input.owner}/${input.repo}@${input.ref.value}` : `${input.owner}/${input.repo}`,
    kind: "github",
    normalizedInput,
    owner: input.owner,
    rawInput: input.rawInput,
    ref: input.ref,
    repo: input.repo,
    repositoryUrl,
    subpath: input.subpath,
  };
}

function parseGitHubContext(pathSegments: string[], searchParams: URLSearchParams): {
  ref?: GitHubRefDescriptor;
  subpath?: string;
} {
  const queryRef = normalizeString(searchParams.get("ref"));

  if (pathSegments.length === 0) {
    return queryRef
      ? {
          ref: {
            exact: true,
            source: "query",
            type: "unknown",
            value: queryRef,
          },
        }
      : {};
  }

  const route = pathSegments[0];
  const routeDetails = pathSegments.slice(1);

  if (route === "commit" && routeDetails[0]) {
    return {
      ref: {
        exact: true,
        source: "commit",
        type: "commit",
        value: routeDetails[0],
      },
    };
  }

  if (route === "releases" && routeDetails[0] === "tag" && routeDetails.length >= 2) {
    return {
      ref: {
        exact: true,
        source: "release",
        type: "tag",
        value: routeDetails.slice(1).join("/"),
      },
    };
  }

  if (route === "archive") {
    const archiveRef = parseGitHubArchiveRef(routeDetails);

    if (archiveRef) {
      return { ref: archiveRef };
    }
  }

  if (queryRef) {
    return {
      ref: {
        exact: true,
        source: "query",
        type: "unknown",
        value: queryRef,
      },
    };
  }

  if (route === "tree") {
    if (routeDetails.length === 1) {
      return {
        ref: {
          exact: true,
          source: "path",
          type: "unknown",
          value: routeDetails[0],
        },
      };
    }

    return {
      ref: {
        exact: false,
        source: "path",
        type: "unknown",
        value: routeDetails.join("/"),
      },
    };
  }

  if (route === "blob") {
    if (routeDetails.length === 2) {
      return {
        ref: {
          exact: true,
          source: "path",
          type: "unknown",
          value: routeDetails[0],
        },
        subpath: routeDetails[1],
      };
    }

    if (routeDetails.length > 2) {
      return {
        ref: {
          exact: false,
          source: "path",
          type: "unknown",
          value: routeDetails.join("/"),
        },
      };
    }
  }

  return {};
}

function parseGitHubArchiveRef(pathSegments: string[]): GitHubRefDescriptor | undefined {
  if (pathSegments[0] === "refs" && (pathSegments[1] === "heads" || pathSegments[1] === "tags")) {
    const encodedRef = stripArchiveExtension(pathSegments.slice(2).join("/"));

    if (!encodedRef) {
      return undefined;
    }

    return {
      exact: true,
      source: "archive",
      type: pathSegments[1] === "heads" ? "branch" : "tag",
      value: encodedRef,
    };
  }

  const encodedRef = stripArchiveExtension(pathSegments.join("/"));

  if (!encodedRef) {
    return undefined;
  }

  return {
    exact: true,
    source: "archive",
    type: "unknown",
    value: encodedRef,
  };
}

function extractDockerHubRepositoryFromUrl(
  pathSegments: string[],
  searchParams: URLSearchParams,
): { namespace: string; repository: string; tag?: string } | undefined {
  const tag = normalizeString(searchParams.get("tag") ?? searchParams.get("name"));

  if (pathSegments[0] === "_" && pathSegments[1]) {
    return {
      namespace: "library",
      repository: pathSegments[1],
      tag: extractDockerHubTag(pathSegments.slice(2), tag),
    };
  }

  if (pathSegments[0] === "r" && pathSegments[1] && pathSegments[2]) {
    return {
      namespace: pathSegments[1],
      repository: pathSegments[2],
      tag: extractDockerHubTag(pathSegments.slice(3), tag),
    };
  }

  if (pathSegments[0] === "repository" && pathSegments[1] === "docker" && pathSegments[2] && pathSegments[3]) {
    return {
      namespace: pathSegments[2],
      repository: pathSegments[3],
      tag: extractDockerHubTag(pathSegments.slice(4), tag),
    };
  }

  if (pathSegments[0] === "layers" && pathSegments[1] && pathSegments[2]) {
    return {
      namespace: pathSegments[1],
      repository: pathSegments[2],
      tag: pathSegments[3] ?? tag,
    };
  }

  return undefined;
}

function extractDockerHubTag(pathSegments: string[], queryTag?: string): string | undefined {
  if (pathSegments[0] === "tag" && pathSegments[1]) {
    return pathSegments[1];
  }

  return queryTag;
}

function coerceWebUrl(input: string): string | undefined {
  if (HTTP_URL_PATTERN.test(input)) {
    return input;
  }

  if (GITHUB_SHORT_URL_PATTERN.test(input) || DOCKER_HUB_SHORT_URL_PATTERN.test(input)) {
    return `https://${input}`;
  }

  return undefined;
}

function getPathSegments(url: URL): string[] {
  return url.pathname
    .split("/")
    .filter(Boolean)
    .map(decodePathSegment);
}

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function stripArchiveExtension(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value.endsWith(".tar.gz")) {
    return value.slice(0, -7);
  }

  if (value.endsWith(".zip")) {
    return value.slice(0, -4);
  }

  return value;
}

function stripGitSuffix(value: string): string {
  return value.endsWith(".git") ? value.slice(0, -4) : value;
}

function normalizeString(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function isRegistryHost(value: string): boolean {
  return value.includes(".") || value.includes(":") || value === "localhost";
}

function normalizeDockerRegistryHost(value: string): string {
  const normalized = value.toLowerCase();
  return normalized === "index.docker.io" || normalized === "registry-1.docker.io" ? "docker.io" : normalized;
}

function fail(input: string, messages: SourceMessage[]): ParseSourceFailure {
  return {
    input,
    messages,
    ok: false,
  };
}

function error(code: SourceMessageCode, message: string, suggestion?: string): SourceMessage {
  return {
    code,
    message,
    severity: "error",
    suggestion,
  };
}

function warning(code: SourceMessageCode, message: string, suggestion?: string): SourceMessage {
  return {
    code,
    message,
    severity: "warning",
    suggestion,
  };
}
