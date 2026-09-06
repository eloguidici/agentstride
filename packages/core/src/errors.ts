/**
 * Small set of typed errors for consumers, retries and debugging.
 * Prefer these over stringly-typed Error messages where the contract matters.
 */

export class AgentRunTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "AgentRunTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export class AgentAbortError extends Error {
  constructor(message = "Agent run was aborted") {
    super(message);
    this.name = "AgentAbortError";
  }
}

export class ToolExecutionError extends Error {
  readonly toolName: string;
  override readonly cause: unknown;

  constructor(toolName: string, cause: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Tool "${toolName}" failed: ${detail}`);
    this.name = "ToolExecutionError";
    this.toolName = toolName;
    this.cause = cause;
  }
}

export function isAgentRunTimeoutError(
  error: unknown,
): error is AgentRunTimeoutError {
  return error instanceof AgentRunTimeoutError;
}

export function isAgentAbortError(error: unknown): error is AgentAbortError {
  return error instanceof AgentAbortError;
}
