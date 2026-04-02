use std::error::Error;
use std::fmt::{Display, Formatter};

use serde::Serialize;

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum DockpackErrorCode {
    InvalidInput,
    UnsupportedSource,
    RuntimeUnavailable,
    ExternalToolFailed,
    LogStreamFailed,
    Internal,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DockpackCommandError {
    pub code: DockpackErrorCode,
    pub message: String,
    pub details: Option<String>,
    pub retryable: bool,
    pub user_action: Option<String>,
}

#[allow(dead_code)]
impl DockpackCommandError {
    pub fn invalid_input(message: impl Into<String>, user_action: impl Into<String>) -> Self {
        Self {
            code: DockpackErrorCode::InvalidInput,
            message: message.into(),
            details: None,
            retryable: false,
            user_action: Some(user_action.into()),
        }
    }

    pub fn unsupported_source(message: impl Into<String>, user_action: impl Into<String>) -> Self {
        Self {
            code: DockpackErrorCode::UnsupportedSource,
            message: message.into(),
            details: None,
            retryable: false,
            user_action: Some(user_action.into()),
        }
    }

    pub fn runtime_unavailable(
        message: impl Into<String>,
        details: impl Into<String>,
        user_action: impl Into<String>,
    ) -> Self {
        Self {
            code: DockpackErrorCode::RuntimeUnavailable,
            message: message.into(),
            details: Some(details.into()),
            retryable: true,
            user_action: Some(user_action.into()),
        }
    }

    pub fn external_tool_failed(
        message: impl Into<String>,
        details: impl Into<String>,
        user_action: impl Into<String>,
    ) -> Self {
        Self {
            code: DockpackErrorCode::ExternalToolFailed,
            message: message.into(),
            details: Some(details.into()),
            retryable: true,
            user_action: Some(user_action.into()),
        }
    }

    pub fn log_stream_failed(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self {
            code: DockpackErrorCode::LogStreamFailed,
            message: message.into(),
            details: Some(details.into()),
            retryable: true,
            user_action: Some(
                "Try starting the log stream again. If the problem keeps happening, restart DockPack.".into(),
            ),
        }
    }

    pub fn internal(message: impl Into<String>, details: impl Into<String>) -> Self {
        Self {
            code: DockpackErrorCode::Internal,
            message: message.into(),
            details: Some(details.into()),
            retryable: false,
            user_action: Some(
                "Try the action again. If it still fails, inspect the Rust backend logs.".into(),
            ),
        }
    }
}

impl Display for DockpackCommandError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)
    }
}

impl Error for DockpackCommandError {}
