import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { JsonSchemaObject } from "./schema.js";

export type AgentContext = Readonly<Record<string, unknown>>;

export type ToolCall = Readonly<{
  id?: string;
  name: string;
  input: unknown;
}>;

export type ToolDefinition = Readonly<{
  name: string;
  description: string;
  parameters?: Readonly<Record<string, unknown>>;
}>;

export type AgentMessage =
  | Readonly<{ role: "system" | "user"; content: string }>
  | Readonly<{
      role: "assistant";
      content?: string;
      toolCalls?: readonly ToolCall[];
    }>
  | Readonly<{
      role: "tool";
      name: string;
      toolCallId?: string;
      output: unknown;
    }>;

export type ModelRequest = Readonly<{
  messages: readonly AgentMessage[];
  tools: readonly ToolDefinition[];
  outputSchema?: JsonSchemaObject;
  /** Cooperative cancellation; providers should pass this to fetch when possible. */
  signal?: AbortSignal;
}>;

export type ModelResponse = Readonly<{
  text?: string;
  toolCalls?: readonly ToolCall[];
  output?: unknown;
  usage?: ModelUsage;
}>;

export type ModelUsage = Readonly<{
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}>;

export interface Model {
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export type AgentRunStatus = "completed" | "failed";

export type AgentEvent =
  | Readonly<{ type: "run:start"; runId: string; input: string }>
  | Readonly<{ type: "model:start"; runId: string; step: number }>
  | Readonly<{
      type: "model:end";
      runId: string;
      step: number;
      usage?: ModelUsage;
    }>
  | Readonly<{
      type: "tool:start";
      runId: string;
      toolName: string;
      toolCallId?: string;
    }>
  | Readonly<{
      type: "tool:end";
      runId: string;
      toolName: string;
      toolCallId?: string;
    }>
  | Readonly<{ type: "run:end"; runId: string; status: "completed" }>
  | Readonly<{ type: "run:error"; runId: string; error: unknown }>;

export type AgentRun<TOutput = unknown> = Readonly<{
  id: string;
  status: AgentRunStatus;
  text: string;
  output?: TOutput;
  steps: number;
  messages: readonly AgentMessage[];
  startedAt: number;
  endedAt: number;
  durationMs: number;
  events: readonly AgentEvent[];
  error?: unknown;
}>;

/** @deprecated Prefer AgentRun. Kept as an alias during the transition. */
export type AgentRunResult<TOutput = unknown> = AgentRun<TOutput>;

export interface AgentLike<I = string, O = AgentRun> {
  run(input: I, options?: {
    context?: AgentContext;
    [key: string]: unknown;
  }): Promise<O>;
}

export interface Memory {
  load(threadId: string): Promise<AgentMessage[]>;
  save(threadId: string, messages: readonly AgentMessage[]): Promise<void>;
}

export type InferSchemaOutput<TSchema> = TSchema extends StandardSchemaV1<
  unknown,
  infer TOutput
>
  ? TOutput
  : unknown;
