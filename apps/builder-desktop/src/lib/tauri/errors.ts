export type DockpackErrorCode =
  | "INVALID_INPUT"
  | "UNSUPPORTED_SOURCE"
  | "RUNTIME_UNAVAILABLE"
  | "EXTERNAL_TOOL_FAILED"
  | "LOG_STREAM_FAILED"
  | "INTERNAL";

export interface DockpackCommandError {
  code: DockpackErrorCode;
  message: string;
  details?: string | null;
  retryable: boolean;
  userAction?: string | null;
}

export function isDockpackCommandError(value: unknown): value is DockpackCommandError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DockpackCommandError>;
  return typeof candidate.code === "string" && typeof candidate.message === "string" && typeof candidate.retryable === "boolean";
}

export function normalizeDockpackCommandError(error: unknown): DockpackCommandError {
  if (isDockpackCommandError(error)) {
    return error;
  }

  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error) as unknown;
      if (isDockpackCommandError(parsed)) {
        return parsed;
      }
    } catch {
      return {
        code: "INTERNAL",
        message: error,
        retryable: false,
        userAction: "Inspect the backend logs for more detail.",
      };
    }
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL",
      message: error.message,
      retryable: false,
      details: error.stack,
      userAction: "Inspect the frontend console and backend logs for more detail.",
    };
  }

  return {
    code: "INTERNAL",
    message: "DockPack received an unexpected backend error shape.",
    retryable: false,
    details: JSON.stringify(error),
    userAction: "Inspect the frontend console and backend logs for more detail.",
  };
}
