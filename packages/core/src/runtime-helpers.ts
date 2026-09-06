import {
  AgentAbortError,
  AgentRunTimeoutError,
} from "./errors.js";
import type {
  AgentContext,
  AgentMessage,
  AgentRun,
  ModelRequest,
  ModelResponse,
  ToolCall,
} from "./types.js";

export type HookContext = Readonly<{
  runId: string;
  input: string;
  context: AgentContext;
  messages: readonly AgentMessage[];
  step?: number;
  toolCall?: ToolCall;
  toolOutput?: unknown;
  modelRequest?: ModelRequest;
  modelResponse?: ModelResponse;
  error?: unknown;
}>;

export type AgentHooks = Readonly<{
  beforeRun?: (ctx: HookContext) => void | Promise<void>;
  beforeModel?: (ctx: HookContext) => void | Promise<void>;
  afterModel?: (ctx: HookContext) => void | Promise<void>;
  beforeTool?: (ctx: HookContext) => void | Promise<void>;
  afterTool?: (ctx: HookContext) => void | Promise<void>;
  onError?: (ctx: HookContext) => void | Promise<void>;
}>;

/** Reserved context key for tools that opt into cooperative cancellation. */
export const ABORT_SIGNAL_CONTEXT_KEY = "abortSignal";

export function assertToolAllowed(
  toolName: string,
  allowedTools: readonly string[] | undefined,
  deniedTools: readonly string[] | undefined,
): void {
  if (deniedTools?.includes(toolName)) {
    throw new Error(`Tool "${toolName}" is denied by guard`);
  }

  if (allowedTools && !allowedTools.includes(toolName)) {
    throw new Error(`Tool "${toolName}" is not in allowedTools`);
  }
}

/**
 * Run work against a combined AbortSignal (external + optional timeout).
 * Prefer this over Promise.race when the work can honor `signal`.
 */
export async function runWithDeadline<T>(
  work: (signal: AbortSignal) => Promise<T>,
  options: {
    timeoutMs?: number;
    signal?: AbortSignal;
    label?: string;
  } = {},
): Promise<T> {
  const label = options.label ?? "Operation";
  const controller = new AbortController();
  const external = options.signal;

  const onExternalAbort = () => {
    if (!controller.signal.aborted) {
      controller.abort(
        external?.reason instanceof Error
          ? external.reason
          : new AgentAbortError(),
      );
    }
  };

  if (external) {
    if (external.aborted) {
      onExternalAbort();
    } else {
      external.addEventListener("abort", onExternalAbort, { once: true });
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  if (options.timeoutMs !== undefined) {
    if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0) {
      throw new Error("timeoutMs must be a positive number");
    }
    timer = setTimeout(() => {
      if (!controller.signal.aborted) {
        controller.abort(new AgentRunTimeoutError(label, options.timeoutMs!));
      }
    }, options.timeoutMs);
  }

  try {
    if (controller.signal.aborted) {
      throw normalizeAbortReason(controller.signal.reason, label, options.timeoutMs);
    }

    return await Promise.race([
      work(controller.signal),
      whenAborted(controller.signal, label, options.timeoutMs),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    external?.removeEventListener("abort", onExternalAbort);
  }
}

function whenAborted(
  signal: AbortSignal,
  label: string,
  timeoutMs: number | undefined,
): Promise<never> {
  return new Promise((_, reject) => {
    const rejectWithReason = () => {
      reject(normalizeAbortReason(signal.reason, label, timeoutMs));
    };
    if (signal.aborted) {
      rejectWithReason();
      return;
    }
    signal.addEventListener("abort", rejectWithReason, { once: true });
  });
}

/**
 * @deprecated Prefer `runWithDeadline` so work can observe AbortSignal.
 * Kept for simple races where the underlying promise cannot be cancelled.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number | undefined,
  label: string,
): Promise<T> {
  return runWithDeadline(async () => promise, {
    label,
    ...(timeoutMs !== undefined ? { timeoutMs } : {}),
  });
}

export function createRunId(): string {
  return `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function finalizeRun<TOutput>(
  partial: Omit<AgentRun<TOutput>, "endedAt" | "durationMs"> & {
    startedAt: number;
  },
): AgentRun<TOutput> {
  const endedAt = Date.now();
  return {
    ...partial,
    endedAt,
    durationMs: endedAt - partial.startedAt,
  };
}

export function withAbortSignalContext(
  context: AgentContext,
  signal: AbortSignal | undefined,
): AgentContext {
  if (!signal) {
    return context;
  }
  return {
    ...context,
    [ABORT_SIGNAL_CONTEXT_KEY]: signal,
  };
}

export function lastAssistantText(
  messages: readonly AgentMessage[],
): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "assistant" && message.content) {
      return message.content;
    }
  }
  return "";
}

function normalizeAbortReason(
  reason: unknown,
  label: string,
  timeoutMs: number | undefined,
): Error {
  if (reason instanceof AgentRunTimeoutError || reason instanceof AgentAbortError) {
    return reason;
  }
  if (reason instanceof Error) {
    return reason;
  }
  if (timeoutMs !== undefined && reason === undefined) {
    return new AgentRunTimeoutError(label, timeoutMs);
  }
  return new AgentAbortError(
    typeof reason === "string" ? reason : undefined,
  );
}
