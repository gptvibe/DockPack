use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandExecution {
    pub operation_id: String,
    pub mode: CommandExecutionMode,
    pub started_at_ms: u64,
    pub completed_at_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CommandExecutionMode {
    Live,
    Simulated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandWarning {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParseSourceRequest {
    pub input: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParseSourceCommandResult {
    pub execution: CommandExecution,
    pub source: SourceDescriptor,
    pub warnings: Vec<CommandWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum SourceDescriptor {
    DockerHub(DockerHubSourceDescriptor),
    Github(GitHubSourceDescriptor),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DockerHubSourceDescriptor {
    pub raw_input: String,
    pub normalized_input: String,
    pub canonical_reference: String,
    pub display_name: String,
    pub repository_url: String,
    pub repository: DockerHubRepositoryDescriptor,
    pub reference: ImageReferenceDescriptor,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DockerHubRepositoryDescriptor {
    pub full_name: String,
    pub is_official: bool,
    pub namespace: String,
    pub repository: String,
    pub registry: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageReferenceDescriptor {
    #[serde(rename = "type")]
    pub reference_type: ImageReferenceType,
    pub value: String,
    pub explicit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ImageReferenceType {
    DefaultTag,
    Tag,
    Digest,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubSourceDescriptor {
    pub raw_input: String,
    pub normalized_input: String,
    pub display_name: String,
    pub repository_url: String,
    pub clone_url: String,
    pub owner: String,
    pub repo: String,
    pub git_ref: Option<GitRefDescriptor>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitRefDescriptor {
    #[serde(rename = "type")]
    pub ref_type: GitRefType,
    pub source: GitRefSource,
    pub value: String,
    pub exact: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GitRefType {
    Branch,
    Commit,
    Tag,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum GitRefSource {
    Archive,
    Commit,
    Path,
    Query,
    Release,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InspectRuntimeRequest {
    pub preferred_runtime: Option<RuntimeKind>,
    pub include_diagnostics: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InspectRuntimeCommandResult {
    pub execution: CommandExecution,
    pub runtimes: Vec<RuntimeInstallation>,
    pub preferred_runtime: Option<RuntimeKind>,
    pub warnings: Vec<CommandWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeInstallation {
    pub kind: RuntimeKind,
    pub available: bool,
    pub version: Option<String>,
    pub binary_path: Option<String>,
    pub daemon_reachable: bool,
    pub checks: Vec<RuntimeCheck>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeCheck {
    pub code: String,
    pub label: String,
    pub status: RuntimeCheckStatus,
    pub detail: String,
    pub action: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RuntimeKind {
    Docker,
    Podman,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RuntimeCheckStatus {
    Pass,
    Warn,
    Fail,
    Skipped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PullImageRequest {
    pub image_reference: String,
    pub platform: Option<String>,
    pub allow_cached: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PullImageCommandResult {
    pub execution: CommandExecution,
    pub image_reference: String,
    pub resolved_reference: String,
    pub image_id: String,
    pub digest: Option<String>,
    pub cached: bool,
    pub layers_downloaded: u32,
    pub warnings: Vec<CommandWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildImageFromGitRequest {
    pub repository_url: String,
    pub git_ref: Option<String>,
    pub image_tag: String,
    pub context_path: Option<String>,
    pub dockerfile_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildImageFromGitCommandResult {
    pub execution: CommandExecution,
    pub repository_url: String,
    pub git_ref: Option<String>,
    pub image_tag: String,
    pub image_id: String,
    pub build_context: String,
    pub dockerfile_path: String,
    pub warnings: Vec<CommandWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InspectImageRequest {
    pub image_reference: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InspectImageCommandResult {
    pub execution: CommandExecution,
    pub image_reference: String,
    pub image_id: String,
    pub digest: Option<String>,
    pub architecture: String,
    pub os: String,
    pub working_dir: Option<String>,
    pub entrypoint: Vec<String>,
    pub cmd: Vec<String>,
    pub exposed_ports: Vec<String>,
    pub environment: Vec<ImageEnvironmentVariable>,
    pub labels: HashMap<String, String>,
    pub warnings: Vec<CommandWarning>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageEnvironmentVariable {
    pub name: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamLogsRequest {
    pub source: LogStreamSource,
    pub tail: Option<u32>,
    pub follow: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "kebab-case")]
pub enum LogStreamSource {
    Runtime {
        runtime: Option<RuntimeKind>,
    },
    ImagePull {
        operation_id: Option<String>,
        image_reference: String,
    },
    GitBuild {
        operation_id: Option<String>,
        repository_url: String,
        image_tag: String,
    },
    ImageInspection {
        image_reference: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StreamLogsCommandResult {
    pub execution: CommandExecution,
    pub stream_id: String,
    pub event_name: String,
    pub source: LogStreamSource,
    pub tail: u32,
    pub follow: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogStreamEvent {
    pub stream_id: String,
    pub sequence: u32,
    pub entry: LogEntry,
    pub done: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LogEntry {
    pub level: LogLevel,
    pub message: String,
    pub timestamp_ms: u64,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Trace,
    Debug,
    Info,
    Warn,
    Error,
}
