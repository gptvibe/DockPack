pub mod contracts;
pub mod error;

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::process::Command;
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Emitter, State, Url};

use self::contracts::{
    BuildImageFromGitCommandResult, BuildImageFromGitRequest, CommandExecution,
    CommandExecutionMode, CommandWarning, DockerHubRepositoryDescriptor, DockerHubSourceDescriptor,
    GitHubSourceDescriptor, GitRefDescriptor, GitRefSource, GitRefType, ImageEnvironmentVariable,
    ImageReferenceDescriptor, ImageReferenceType, InspectImageCommandResult, InspectImageRequest,
    InspectRuntimeCommandResult, InspectRuntimeRequest, LogEntry, LogLevel, LogStreamEvent,
    LogStreamSource, ParseSourceCommandResult, ParseSourceRequest, PullImageCommandResult,
    PullImageRequest, RuntimeCheck, RuntimeCheckStatus, RuntimeInstallation, RuntimeKind,
    SourceDescriptor, StreamLogsCommandResult, StreamLogsRequest,
};
use self::error::DockpackCommandError;

pub const LOG_STREAM_EVENT: &str = "dockpack://log-stream";

type CommandResult<T> = Result<T, DockpackCommandError>;

pub struct DockpackBridgeState {
    sequence: AtomicU64,
}

impl Default for DockpackBridgeState {
    fn default() -> Self {
        Self {
            sequence: AtomicU64::new(0),
        }
    }
}

impl DockpackBridgeState {
    fn next_operation_id(&self, prefix: &str) -> String {
        let next = self.sequence.fetch_add(1, Ordering::Relaxed) + 1;
        format!("{prefix}-{next:04}")
    }

    fn completed_execution(&self, prefix: &str, mode: CommandExecutionMode) -> CommandExecution {
        let now = now_ms();

        CommandExecution {
            operation_id: self.next_operation_id(prefix),
            mode,
            started_at_ms: now,
            completed_at_ms: now,
        }
    }
}

#[tauri::command]
pub fn parse_source(
    request: ParseSourceRequest,
    state: State<'_, DockpackBridgeState>,
) -> CommandResult<ParseSourceCommandResult> {
    let trimmed_input = request.input.trim();

    if trimmed_input.is_empty() {
        return Err(DockpackCommandError::invalid_input(
            "DockPack needs a Docker Hub image, a Docker Hub repository link, or a GitHub repository URL.",
            "Paste a source like `nginx:latest`, `https://hub.docker.com/r/library/nginx`, or `https://github.com/octocat/Hello-World`.",
        ));
    }

    let (source, warnings) = if let Some(url_candidate) = coerce_web_url(trimmed_input) {
        let parsed_url = Url::parse(&url_candidate).map_err(|error| {
            DockpackCommandError::invalid_input(
                "That source could not be parsed as a valid web URL.",
                format!("Check the URL formatting and try again. Parser detail: {error}"),
            )
        })?;

        parse_url_source(trimmed_input, &parsed_url)?
    } else {
        parse_docker_image_reference(trimmed_input)?
    };

    Ok(ParseSourceCommandResult {
        execution: state.completed_execution("parse-source", CommandExecutionMode::Live),
        source,
        warnings,
    })
}

#[tauri::command]
pub fn inspect_runtime(
    request: InspectRuntimeRequest,
    state: State<'_, DockpackBridgeState>,
) -> CommandResult<InspectRuntimeCommandResult> {
    let runtimes = vec![
        probe_runtime(RuntimeKind::Docker),
        probe_runtime(RuntimeKind::Podman),
    ];

    let preferred_runtime = choose_preferred_runtime(request.preferred_runtime, &runtimes);
    let available_count = runtimes.iter().filter(|runtime| runtime.available).count();

    let warnings = if available_count == 0 {
        vec![warning(
            "NO_RUNTIME_DETECTED",
            "No supported container runtime was detected. Docker or Podman will be required before DockPack can run packaging commands live.",
        )]
    } else {
        Vec::new()
    };

    Ok(InspectRuntimeCommandResult {
        execution: state.completed_execution("inspect-runtime", CommandExecutionMode::Live),
        runtimes,
        preferred_runtime,
        warnings,
    })
}

#[tauri::command]
pub fn pull_image(
    request: PullImageRequest,
    state: State<'_, DockpackBridgeState>,
) -> CommandResult<PullImageCommandResult> {
    let (source, mut warnings) = parse_docker_image_reference(request.image_reference.trim())?;
    let docker_source = expect_docker_source(source)?;

    warnings.push(simulated_execution_warning(
        "Image pulling is not connected to the local runtime yet, so DockPack is returning a simulated result shape.",
    ));

    let canonical_reference = docker_source.canonical_reference.clone();

    Ok(PullImageCommandResult {
        execution: state.completed_execution("pull-image", CommandExecutionMode::Simulated),
        image_reference: request.image_reference,
        resolved_reference: canonical_reference.clone(),
        image_id: fake_sha(&format!("{canonical_reference}:image-id")),
        digest: Some(fake_sha(&format!("{canonical_reference}:digest"))),
        cached: request.allow_cached,
        layers_downloaded: 0,
        warnings,
    })
}

#[tauri::command]
pub fn build_image_from_git(
    request: BuildImageFromGitRequest,
    state: State<'_, DockpackBridgeState>,
) -> CommandResult<BuildImageFromGitCommandResult> {
    let trimmed_repository_url = request.repository_url.trim();

    let (source, mut warnings) = parse_url_or_error(trimmed_repository_url)?;
    let github_source = expect_github_source(source)?;

    let image_tag = request.image_tag.trim();

    if image_tag.is_empty() {
        return Err(DockpackCommandError::invalid_input(
            "DockPack needs an image tag before it can plan a Git-based build.",
            "Provide a tag like `dockpack/notes-app:dev` and try again.",
        ));
    }

    warnings.push(simulated_execution_warning(
        "Git image builds are not wired to Docker yet, so this result is a simulated bridge response for frontend integration.",
    ));

    Ok(BuildImageFromGitCommandResult {
        execution: state
            .completed_execution("build-image-from-git", CommandExecutionMode::Simulated),
        repository_url: github_source.repository_url,
        git_ref: request
            .git_ref
            .or_else(|| github_source.git_ref.map(|git_ref| git_ref.value)),
        image_tag: image_tag.to_string(),
        image_id: fake_sha(&format!("{image_tag}:build-image")),
        build_context: request.context_path.unwrap_or_else(|| ".".into()),
        dockerfile_path: request
            .dockerfile_path
            .unwrap_or_else(|| "Dockerfile".into()),
        warnings,
    })
}

#[tauri::command]
pub fn inspect_image(
    request: InspectImageRequest,
    state: State<'_, DockpackBridgeState>,
) -> CommandResult<InspectImageCommandResult> {
    let (source, mut warnings) = parse_docker_image_reference(request.image_reference.trim())?;
    let docker_source = expect_docker_source(source)?;
    let canonical_reference = docker_source.canonical_reference.clone();

    warnings.push(simulated_execution_warning(
        "Image inspection is currently simulated so the command bridge can be integrated before Docker inspection is implemented.",
    ));

    let mut labels = std::collections::HashMap::new();
    labels.insert(
        "org.opencontainers.image.source".into(),
        docker_source.repository_url.clone(),
    );
    labels.insert("com.dockpack.bridge.mode".into(), "simulated".into());

    Ok(InspectImageCommandResult {
        execution: state.completed_execution("inspect-image", CommandExecutionMode::Simulated),
        image_reference: request.image_reference,
        image_id: fake_sha(&format!("{canonical_reference}:inspect-image")),
        digest: Some(fake_sha(&format!("{canonical_reference}:inspect-digest"))),
        architecture: "amd64".into(),
        os: "linux".into(),
        working_dir: Some("/app".into()),
        entrypoint: vec!["/usr/local/bin/start-app".into()],
        cmd: vec!["--serve".into()],
        exposed_ports: vec!["8080/tcp".into()],
        environment: vec![
            ImageEnvironmentVariable {
                name: "PORT".into(),
                value: "8080".into(),
            },
            ImageEnvironmentVariable {
                name: "DOCKPACK_SAMPLE".into(),
                value: "true".into(),
            },
        ],
        labels,
        warnings,
    })
}

#[tauri::command]
pub fn stream_logs(
    app: AppHandle,
    request: StreamLogsRequest,
    state: State<'_, DockpackBridgeState>,
) -> CommandResult<StreamLogsCommandResult> {
    let stream_id = state.next_operation_id("log-stream");
    let execution = state.completed_execution("stream-logs", CommandExecutionMode::Simulated);
    let tail = request.tail.unwrap_or(50).min(500);
    let follow = request.follow;
    let source = request.source.clone();
    let event_name = LOG_STREAM_EVENT.to_string();

    thread::spawn({
        let app = app.clone();
        let source = source.clone();
        let stream_id = stream_id.clone();
        let event_name = event_name.clone();

        move || {
            let messages = build_sample_log_messages(&source, follow);

            for (index, (level, message, source_label)) in messages.into_iter().enumerate() {
                let payload = LogStreamEvent {
                    stream_id: stream_id.clone(),
                    sequence: index as u32 + 1,
                    entry: LogEntry {
                        level,
                        message,
                        timestamp_ms: now_ms(),
                        source: source_label,
                    },
                    done: false,
                };

                let _ = app.emit(&event_name, payload);
                thread::sleep(Duration::from_millis(325));
            }

            let completion_event = LogStreamEvent {
                stream_id,
                sequence: 999,
                entry: LogEntry {
                    level: LogLevel::Info,
                    message: "Log stream finished emitting sample entries.".into(),
                    timestamp_ms: now_ms(),
                    source: "dockpack-bridge".into(),
                },
                done: true,
            };

            let _ = app.emit(&event_name, completion_event);
        }
    });

    Ok(StreamLogsCommandResult {
        execution,
        stream_id,
        event_name,
        source,
        tail,
        follow,
    })
}

fn parse_url_or_error(input: &str) -> CommandResult<(SourceDescriptor, Vec<CommandWarning>)> {
    let url_candidate = coerce_web_url(input).ok_or_else(|| {
        DockpackCommandError::invalid_input(
            "That input does not look like a supported web URL.",
            "Use a GitHub repository URL like `https://github.com/owner/repo`.",
        )
    })?;

    let parsed_url = Url::parse(&url_candidate).map_err(|error| {
        DockpackCommandError::invalid_input(
            "That URL could not be parsed.",
            format!("Check the URL format and try again. Parser detail: {error}"),
        )
    })?;

    parse_url_source(input, &parsed_url)
}

fn parse_url_source(
    input: &str,
    parsed_url: &Url,
) -> CommandResult<(SourceDescriptor, Vec<CommandWarning>)> {
    let host = parsed_url
        .host_str()
        .map(|host| host.to_ascii_lowercase())
        .ok_or_else(|| {
            DockpackCommandError::invalid_input(
                "That URL is missing a host name.",
                "Paste a full Docker Hub or GitHub URL and try again.",
            )
        })?;

    match host.as_str() {
        "github.com" | "www.github.com" => parse_github_url(input, parsed_url),
        "hub.docker.com" | "www.hub.docker.com" | "registry.hub.docker.com" => {
            parse_docker_hub_url(input, parsed_url)
        }
        _ => Err(DockpackCommandError::unsupported_source(
            format!("DockPack supports Docker Hub and GitHub sources, but `{host}` is not supported yet."),
            "Paste a Docker Hub image link, Docker Hub image reference, or GitHub repository URL.",
        )),
    }
}

fn parse_docker_hub_url(
    input: &str,
    parsed_url: &Url,
) -> CommandResult<(SourceDescriptor, Vec<CommandWarning>)> {
    let segments = path_segments(parsed_url);
    let tag = parsed_url
        .query_pairs()
        .find_map(|(key, value)| match key.as_ref() {
            "tag" | "name" if !value.is_empty() => Some(value.to_string()),
            _ => None,
        });

    let (namespace, repository, url_tag) = if segments.len() >= 2 && segments[0] == "_" {
        (
            "library".to_string(),
            segments[1].clone(),
            extract_tag_from_segments(&segments[2..], tag),
        )
    } else if segments.len() >= 3 && segments[0] == "r" {
        (
            segments[1].clone(),
            segments[2].clone(),
            extract_tag_from_segments(&segments[3..], tag),
        )
    } else if segments.len() >= 4 && segments[0] == "repository" && segments[1] == "docker" {
        (
            segments[2].clone(),
            segments[3].clone(),
            extract_tag_from_segments(&segments[4..], tag),
        )
    } else {
        return Err(DockpackCommandError::invalid_input(
            "That Docker Hub URL does not point to a repository page DockPack can analyze.",
            "Paste a repository URL like `https://hub.docker.com/r/library/nginx` or an image reference like `nginx:latest`.",
        ));
    };

    Ok((
        SourceDescriptor::DockerHub(build_docker_source(
            input, namespace, repository, url_tag, None,
        )),
        Vec::new(),
    ))
}

fn parse_github_url(
    input: &str,
    parsed_url: &Url,
) -> CommandResult<(SourceDescriptor, Vec<CommandWarning>)> {
    let segments = path_segments(parsed_url);

    if segments.len() < 2 {
        return Err(DockpackCommandError::invalid_input(
            "That GitHub URL does not include both an owner and repository name.",
            "Paste a repository URL like `https://github.com/owner/repo`.",
        ));
    }

    let owner = segments[0].clone();
    let repo = strip_git_suffix(&segments[1]);
    let (git_ref, warnings) = parse_github_ref(parsed_url, &segments[2..], &owner, &repo);

    let repository_url = format!("https://github.com/{owner}/{repo}");
    let normalized_input = match &git_ref {
        Some(git_ref) => format!("{repository_url}?ref={}", git_ref.value),
        None => repository_url.clone(),
    };
    let display_name = match &git_ref {
        Some(git_ref) => format!("{owner}/{repo}@{}", git_ref.value),
        None => format!("{owner}/{repo}"),
    };

    Ok((
        SourceDescriptor::Github(GitHubSourceDescriptor {
            raw_input: input.to_string(),
            normalized_input,
            display_name,
            repository_url: repository_url.clone(),
            clone_url: format!("{repository_url}.git"),
            owner,
            repo,
            git_ref,
        }),
        warnings,
    ))
}

fn parse_github_ref(
    parsed_url: &Url,
    extra_segments: &[String],
    owner: &str,
    repo: &str,
) -> (Option<GitRefDescriptor>, Vec<CommandWarning>) {
    let query_ref = parsed_url
        .query_pairs()
        .find_map(|(key, value)| (key == "ref" && !value.is_empty()).then(|| value.to_string()));

    if extra_segments.is_empty() {
        return (
            query_ref.map(|value| GitRefDescriptor {
                ref_type: GitRefType::Unknown,
                source: GitRefSource::Query,
                value,
                exact: true,
            }),
            Vec::new(),
        );
    }

    let route = extra_segments[0].as_str();
    let details = &extra_segments[1..];

    let descriptor = match route {
        "commit" if !details.is_empty() => Some(GitRefDescriptor {
            ref_type: GitRefType::Commit,
            source: GitRefSource::Commit,
            value: details[0].clone(),
            exact: true,
        }),
        "releases" if details.len() >= 2 && details[0] == "tag" => Some(GitRefDescriptor {
            ref_type: GitRefType::Tag,
            source: GitRefSource::Release,
            value: details[1..].join("/"),
            exact: true,
        }),
        "archive" if !details.is_empty() => parse_archive_ref(details),
        "tree" if !details.is_empty() => Some(GitRefDescriptor {
            ref_type: GitRefType::Unknown,
            source: GitRefSource::Path,
            value: details.join("/"),
            exact: details.len() == 1,
        }),
        "blob" if !details.is_empty() => Some(GitRefDescriptor {
            ref_type: GitRefType::Unknown,
            source: GitRefSource::Path,
            value: details.join("/"),
            exact: details.len() <= 2,
        }),
        _ => query_ref.map(|value| GitRefDescriptor {
            ref_type: GitRefType::Unknown,
            source: GitRefSource::Query,
            value,
            exact: true,
        }),
    };

    let warnings = descriptor
        .as_ref()
        .filter(|git_ref| !git_ref.exact)
        .map(|_| {
            vec![warning(
                "AMBIGUOUS_GIT_REF",
                format!(
                    "DockPack recognized {owner}/{repo}, but the branch or ref could not be extracted with full confidence from the pasted GitHub URL."
                ),
            )]
        })
        .unwrap_or_default();

    (descriptor, warnings)
}

fn parse_archive_ref(details: &[String]) -> Option<GitRefDescriptor> {
    if details.len() >= 3 && details[0] == "refs" && (details[1] == "heads" || details[1] == "tags")
    {
        let ref_type = if details[1] == "heads" {
            GitRefType::Branch
        } else {
            GitRefType::Tag
        };

        return Some(GitRefDescriptor {
            ref_type,
            source: GitRefSource::Archive,
            value: strip_archive_suffix(&details[2..].join("/")),
            exact: true,
        });
    }

    Some(GitRefDescriptor {
        ref_type: GitRefType::Unknown,
        source: GitRefSource::Archive,
        value: strip_archive_suffix(&details.join("/")),
        exact: true,
    })
}

fn parse_docker_image_reference(
    input: &str,
) -> CommandResult<(SourceDescriptor, Vec<CommandWarning>)> {
    if input.chars().any(char::is_whitespace) {
        return Err(DockpackCommandError::invalid_input(
            "Docker image references cannot contain spaces.",
            "Use a reference like `nginx:latest` or `acme/notes-desktop:1.4.0`.",
        ));
    }

    let digest_parts: Vec<&str> = input.split('@').collect();

    if digest_parts.len() > 2 {
        return Err(DockpackCommandError::invalid_input(
            "That image reference includes more than one digest marker.",
            "Keep a single digest suffix like `@sha256:...`.",
        ));
    }

    let digest = if digest_parts.len() == 2 {
        if digest_parts[1].is_empty() {
            return Err(DockpackCommandError::invalid_input(
                "That Docker image reference ends with `@`, but the digest is missing.",
                "Add a full digest like `@sha256:...` or remove the trailing `@`.",
            ));
        }

        Some(digest_parts[1].to_string())
    } else {
        None
    };

    let mut path_segments: Vec<&str> = digest_parts[0].split('/').collect();

    if path_segments.iter().any(|segment| segment.is_empty()) {
        return Err(DockpackCommandError::invalid_input(
            "That Docker image reference is missing part of the repository name.",
            "Use an official image like `nginx:latest` or a namespaced image like `namespace/app:1.0.0`.",
        ));
    }

    if path_segments.len() > 1 && is_registry_host(path_segments[0]) {
        let registry = normalize_registry_host(path_segments[0]);

        if registry != "docker.io" {
            return Err(DockpackCommandError::unsupported_source(
                format!(
                    "DockPack currently supports Docker Hub only, but `{registry}` was provided."
                ),
                "Use a Docker Hub image reference like `namespace/app:tag`.",
            ));
        }

        path_segments.remove(0);
    }

    if path_segments.is_empty() {
        return Err(DockpackCommandError::invalid_input(
            "That Docker Hub reference is missing a repository name.",
            "Use an image like `nginx:latest` or `namespace/app:1.0.0`.",
        ));
    }

    let last_segment = path_segments
        .pop()
        .expect("path_segments checked to be non-empty");
    let (repository_segment, tag) = split_repository_tag(last_segment)?;
    path_segments.push(repository_segment);

    let (namespace, repository) = match path_segments.as_slice() {
        [repository] => ("library".to_string(), repository.to_string()),
        [namespace, repository] => (namespace.to_string(), repository.to_string()),
        _ => return Err(DockpackCommandError::invalid_input(
            "That Docker Hub image reference has too many path segments.",
            "Use an official image like `nginx` or a namespaced image like `namespace/app:tag`.",
        )),
    };

    Ok((
        SourceDescriptor::DockerHub(build_docker_source(
            input, namespace, repository, tag, digest,
        )),
        Vec::new(),
    ))
}

fn build_docker_source(
    raw_input: &str,
    namespace: String,
    repository: String,
    tag: Option<String>,
    digest: Option<String>,
) -> DockerHubSourceDescriptor {
    let full_name = format!("{namespace}/{repository}");
    let is_official = namespace == "library";
    let reference = match (digest, tag) {
        (Some(digest), _) => ImageReferenceDescriptor {
            reference_type: ImageReferenceType::Digest,
            value: digest,
            explicit: true,
        },
        (None, Some(tag)) => ImageReferenceDescriptor {
            reference_type: ImageReferenceType::Tag,
            value: tag,
            explicit: true,
        },
        (None, None) => ImageReferenceDescriptor {
            reference_type: ImageReferenceType::DefaultTag,
            value: "latest".into(),
            explicit: false,
        },
    };

    let canonical_reference = match reference.reference_type {
        ImageReferenceType::Digest => format!("docker.io/{full_name}@{}", reference.value),
        _ => format!("docker.io/{full_name}:{}", reference.value),
    };

    DockerHubSourceDescriptor {
        raw_input: raw_input.to_string(),
        normalized_input: canonical_reference.clone(),
        canonical_reference: canonical_reference.clone(),
        display_name: match reference.reference_type {
            ImageReferenceType::Digest => format!("{full_name}@{}", reference.value),
            _ => format!("{full_name}:{}", reference.value),
        },
        repository_url: if is_official {
            format!("https://hub.docker.com/_/{repository}")
        } else {
            format!("https://hub.docker.com/r/{full_name}")
        },
        repository: DockerHubRepositoryDescriptor {
            full_name,
            is_official,
            namespace,
            repository,
            registry: "docker.io".into(),
        },
        reference,
    }
}

fn expect_docker_source(source: SourceDescriptor) -> CommandResult<DockerHubSourceDescriptor> {
    match source {
        SourceDescriptor::DockerHub(source) => Ok(source),
        SourceDescriptor::Github(_) => Err(DockpackCommandError::invalid_input(
            "A Docker image command received a GitHub repository instead of a Docker Hub image.",
            "Use a Docker Hub image reference like `nginx:latest` or a Docker Hub repository URL.",
        )),
    }
}

fn expect_github_source(source: SourceDescriptor) -> CommandResult<GitHubSourceDescriptor> {
    match source {
        SourceDescriptor::Github(source) => Ok(source),
        SourceDescriptor::DockerHub(_) => Err(DockpackCommandError::invalid_input(
            "A Git build command received a Docker Hub source instead of a Git repository URL.",
            "Use a GitHub repository URL like `https://github.com/owner/repo`.",
        )),
    }
}

fn probe_runtime(kind: RuntimeKind) -> RuntimeInstallation {
    let binary = match kind {
        RuntimeKind::Docker => "docker",
        RuntimeKind::Podman => "podman",
    };

    let binary_path = find_binary_path(binary);
    let version_output = run_command(binary, ["--version"]);

    let (available, version, mut checks) = match version_output {
        Ok(output) => (
            true,
            Some(output.clone()),
            vec![RuntimeCheck {
                code: "CLI_DETECTED".into(),
                label: format!("{binary} CLI"),
                status: RuntimeCheckStatus::Pass,
                detail: output,
                action: None,
            }],
        ),
        Err(error) => (
            false,
            None,
            vec![RuntimeCheck {
                code: "CLI_MISSING".into(),
                label: format!("{binary} CLI"),
                status: RuntimeCheckStatus::Fail,
                detail: error,
                action: Some(format!(
                    "Install {binary} or add it to PATH before running live DockPack packaging commands."
                )),
            }],
        ),
    };

    let daemon_result = if available {
        run_command(binary, ["info", "--format", "{{.ServerVersion}}"])
    } else {
        Err("CLI is not available, so daemon reachability was skipped.".into())
    };

    let daemon_reachable = daemon_result.is_ok();
    checks.push(match daemon_result {
        Ok(output) => RuntimeCheck {
            code: "DAEMON_REACHABLE".into(),
            label: format!("{binary} daemon"),
            status: RuntimeCheckStatus::Pass,
            detail: format!("Runtime responded with version {output}."),
            action: None,
        },
        Err(detail) if available => RuntimeCheck {
            code: "DAEMON_UNAVAILABLE".into(),
            label: format!("{binary} daemon"),
            status: RuntimeCheckStatus::Warn,
            detail,
            action: Some("Start the runtime daemon and try the command again.".into()),
        },
        Err(detail) => RuntimeCheck {
            code: "DAEMON_SKIPPED".into(),
            label: format!("{binary} daemon"),
            status: RuntimeCheckStatus::Skipped,
            detail,
            action: None,
        },
    });

    RuntimeInstallation {
        kind,
        available,
        version,
        binary_path,
        daemon_reachable,
        checks,
    }
}

fn choose_preferred_runtime(
    requested: Option<RuntimeKind>,
    runtimes: &[RuntimeInstallation],
) -> Option<RuntimeKind> {
    if let Some(requested) = requested {
        let requested_available = runtimes
            .iter()
            .any(|runtime| runtime.kind == requested && runtime.available);

        if requested_available {
            return Some(requested);
        }
    }

    runtimes
        .iter()
        .find(|runtime| runtime.available)
        .map(|runtime| runtime.kind.clone())
}

fn build_sample_log_messages(
    source: &LogStreamSource,
    follow: bool,
) -> Vec<(LogLevel, String, String)> {
    let mut entries = match source {
        LogStreamSource::Runtime { runtime } => {
            let runtime_label = runtime
                .as_ref()
                .map(runtime_kind_label)
                .unwrap_or("container runtime");

            vec![
                (
                    LogLevel::Info,
                    format!("Checking {runtime_label} availability before live execution."),
                    "runtime-probe".into(),
                ),
                (
                    LogLevel::Debug,
                    format!("Bridge is emitting sample logs for {runtime_label}."),
                    "runtime-probe".into(),
                ),
                (
                    LogLevel::Warn,
                    "These entries are simulated so the frontend can be built against a stable stream contract.".into(),
                    "dockpack-bridge".into(),
                ),
            ]
        }
        LogStreamSource::ImagePull {
            image_reference,
            operation_id,
        } => vec![
            (
                LogLevel::Info,
                format!(
                    "Preparing pull session for {image_reference}{}.",
                    operation_id
                        .as_ref()
                        .map(|operation_id| format!(" ({operation_id})"))
                        .unwrap_or_default()
                ),
                "image-pull".into(),
            ),
            (
                LogLevel::Debug,
                "Request was accepted by the bridge and queued for simulated progress.".into(),
                "image-pull".into(),
            ),
            (
                LogLevel::Info,
                "Live Docker pull integration will plug into this exact stream later.".into(),
                "dockpack-bridge".into(),
            ),
        ],
        LogStreamSource::GitBuild {
            repository_url,
            image_tag,
            ..
        } => vec![
            (
                LogLevel::Info,
                format!("Planning Git build for {repository_url}."),
                "git-build".into(),
            ),
            (
                LogLevel::Debug,
                format!("Expected output tag: {image_tag}."),
                "git-build".into(),
            ),
            (
                LogLevel::Warn,
                "Git-based image building is not live yet, so these entries are bridge scaffolding.".into(),
                "dockpack-bridge".into(),
            ),
        ],
        LogStreamSource::ImageInspection { image_reference } => vec![
            (
                LogLevel::Info,
                format!("Inspecting {image_reference}."),
                "image-inspection".into(),
            ),
            (
                LogLevel::Debug,
                "Returning simulated image metadata to exercise the frontend contract.".into(),
                "image-inspection".into(),
            ),
            (
                LogLevel::Info,
                "Once Docker inspection is wired, the stream payload shape will stay the same.".into(),
                "dockpack-bridge".into(),
            ),
        ],
    };

    if follow {
        entries.push((
            LogLevel::Info,
            "Follow mode is enabled, so the stream is keeping the subscription open until the bridge finishes its sample batch.".into(),
            "dockpack-bridge".into(),
        ));
    }

    entries
}

fn coerce_web_url(input: &str) -> Option<String> {
    let lower = input.to_ascii_lowercase();

    if lower.starts_with("http://") || lower.starts_with("https://") {
        return Some(input.to_string());
    }

    if lower.starts_with("github.com/")
        || lower == "github.com"
        || lower.starts_with("hub.docker.com/")
        || lower == "hub.docker.com"
    {
        return Some(format!("https://{input}"));
    }

    None
}

fn path_segments(url: &Url) -> Vec<String> {
    url.path_segments()
        .map(|segments| {
            segments
                .filter(|segment| !segment.is_empty())
                .map(ToOwned::to_owned)
                .collect()
        })
        .unwrap_or_default()
}

fn extract_tag_from_segments(segments: &[String], fallback: Option<String>) -> Option<String> {
    if segments.len() >= 2 && segments[0] == "tag" {
        return Some(segments[1].clone());
    }

    fallback
}

fn strip_git_suffix(value: &str) -> String {
    value.strip_suffix(".git").unwrap_or(value).to_string()
}

fn strip_archive_suffix(value: &str) -> String {
    value
        .strip_suffix(".tar.gz")
        .or_else(|| value.strip_suffix(".zip"))
        .unwrap_or(value)
        .to_string()
}

fn split_repository_tag(last_segment: &str) -> CommandResult<(&str, Option<String>)> {
    if let Some(separator_index) = last_segment.rfind(':') {
        let repository = &last_segment[..separator_index];
        let tag = &last_segment[separator_index + 1..];

        if tag.is_empty() {
            return Err(DockpackCommandError::invalid_input(
                "That Docker image reference ends with `:`, but the tag is missing.",
                "Add a tag like `:latest` or remove the trailing `:`.",
            ));
        }

        return Ok((repository, Some(tag.to_string())));
    }

    Ok((last_segment, None))
}

fn is_registry_host(value: &str) -> bool {
    value.contains('.') || value.contains(':') || value == "localhost"
}

fn normalize_registry_host(value: &str) -> &str {
    match value {
        "index.docker.io" | "registry-1.docker.io" => "docker.io",
        _ => value,
    }
}

fn find_binary_path(binary: &str) -> Option<String> {
    let candidate = if cfg!(windows) {
        Command::new("where")
            .arg(binary)
            .output()
            .ok()
            .and_then(success_stdout)
    } else {
        Command::new("which")
            .arg(binary)
            .output()
            .ok()
            .and_then(success_stdout)
    };

    candidate.and_then(|stdout| stdout.lines().next().map(|line| line.trim().to_string()))
}

fn run_command<I, S>(program: &str, args: I) -> Result<String, String>
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let mut command = Command::new(program);
    for argument in args {
        command.arg(argument.as_ref());
    }

    let output = command
        .output()
        .map_err(|error| format!("Failed to spawn `{program}`: {error}"))?;

    if output.status.success() {
        success_stdout(output).ok_or_else(|| format!("`{program}` returned no stdout output."))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
        let detail = if !stderr.is_empty() { stderr } else { stdout };
        Err(format!("`{program}` failed: {detail}"))
    }
}

fn success_stdout(output: std::process::Output) -> Option<String> {
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    (!stdout.is_empty()).then_some(stdout)
}

fn runtime_kind_label(kind: &RuntimeKind) -> &'static str {
    match kind {
        RuntimeKind::Docker => "Docker",
        RuntimeKind::Podman => "Podman",
    }
}

fn warning(code: impl Into<String>, message: impl Into<String>) -> CommandWarning {
    CommandWarning {
        code: code.into(),
        message: message.into(),
    }
}

fn simulated_execution_warning(message: impl Into<String>) -> CommandWarning {
    warning("SIMULATED_EXECUTION", message)
}

fn fake_sha(seed: &str) -> String {
    let mut hasher = DefaultHasher::new();
    seed.hash(&mut hasher);
    let digest = format!("{:016x}", hasher.finish());
    format!("sha256:{}", digest.repeat(4))
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
