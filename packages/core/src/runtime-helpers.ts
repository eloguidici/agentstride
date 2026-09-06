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

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number | undefined,
  label: string,
): Promise<T> {
  if (timeoutMs === undefined) {
    return promise;
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive number");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
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
