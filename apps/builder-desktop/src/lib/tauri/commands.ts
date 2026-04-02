import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

import {
  DOCKPACK_LOG_STREAM_EVENT,
  type BuildImageFromGitCommandResult,
  type BuildImageFromGitRequest,
  type InspectImageCommandResult,
  type InspectImageRequest,
  type InspectRuntimeCommandResult,
  type InspectRuntimeRequest,
  type LogStreamEvent,
  type ParseSourceCommandResult,
  type ParseSourceRequest,
  type PullImageCommandResult,
  type PullImageRequest,
  type StreamLogsCommandResult,
  type StreamLogsRequest,
} from "@/lib/tauri/contracts";
import { normalizeDockpackCommandError } from "@/lib/tauri/errors";

export const dockpackCommandNames = {
  parseSource: "parse_source",
  inspectRuntime: "inspect_runtime",
  pullImage: "pull_image",
  buildImageFromGit: "build_image_from_git",
  inspectImage: "inspect_image",
  streamLogs: "stream_logs",
} as const;

export interface DockpackCommandRequestMap {
  parse_source: ParseSourceRequest;
  inspect_runtime: InspectRuntimeRequest;
  pull_image: PullImageRequest;
  build_image_from_git: BuildImageFromGitRequest;
  inspect_image: InspectImageRequest;
  stream_logs: StreamLogsRequest;
}

export interface DockpackCommandResultMap {
  parse_source: ParseSourceCommandResult;
  inspect_runtime: InspectRuntimeCommandResult;
  pull_image: PullImageCommandResult;
  build_image_from_git: BuildImageFromGitCommandResult;
  inspect_image: InspectImageCommandResult;
  stream_logs: StreamLogsCommandResult;
}

export type DockpackCommandName = keyof DockpackCommandRequestMap;

async function invokeDockpackCommand<TCommandName extends DockpackCommandName>(
  command: TCommandName,
  request: DockpackCommandRequestMap[TCommandName],
): Promise<DockpackCommandResultMap[TCommandName]> {
  try {
    return await invoke<DockpackCommandResultMap[TCommandName]>(command, { request });
  } catch (error) {
    throw normalizeDockpackCommandError(error);
  }
}

export async function parseSource(request: ParseSourceRequest): Promise<ParseSourceCommandResult> {
  return invokeDockpackCommand("parse_source", request);
}

export async function inspectRuntime(request: InspectRuntimeRequest): Promise<InspectRuntimeCommandResult> {
  return invokeDockpackCommand("inspect_runtime", request);
}

export async function pullImage(request: PullImageRequest): Promise<PullImageCommandResult> {
  return invokeDockpackCommand("pull_image", request);
}

export async function buildImageFromGit(
  request: BuildImageFromGitRequest,
): Promise<BuildImageFromGitCommandResult> {
  return invokeDockpackCommand("build_image_from_git", request);
}

export async function inspectImage(request: InspectImageRequest): Promise<InspectImageCommandResult> {
  return invokeDockpackCommand("inspect_image", request);
}

export async function streamLogs(request: StreamLogsRequest): Promise<StreamLogsCommandResult> {
  return invokeDockpackCommand("stream_logs", request);
}

export async function listenToDockpackLogStream(
  streamId: string,
  onEvent: (event: LogStreamEvent) => void,
): Promise<UnlistenFn> {
  return listen<LogStreamEvent>(DOCKPACK_LOG_STREAM_EVENT, ({ payload }) => {
    if (payload.streamId === streamId) {
      onEvent(payload);
    }
  });
}

export async function analyzeSourceWithRuntimeCheck(input: string) {
  const parsed = await parseSource({ input });
  const runtime = await inspectRuntime({
    includeDiagnostics: true,
    preferredRuntime: null,
  });

  return { parsed, runtime };
}

export async function startBridgeLogPreview(
  request: StreamLogsRequest,
  onEvent: (event: LogStreamEvent) => void,
) {
  const stream = await streamLogs(request);
  const unlisten = await listenToDockpackLogStream(stream.streamId, onEvent);

  return { stream, unlisten };
}
