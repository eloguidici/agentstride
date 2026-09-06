export type AgentContext = Readonly<Record<string, unknown>>;

export type ToolCall = Readonly<{
  id?: string;
  name: string;
  input: unknown;
}>;

export type ToolDefinition = Readonly<{
  name: string;
  description: string;
}>;

export type AgentMessage =
  | Readonly<{ role: "system" | "user"; content: string }>
  | Readonly<{ role: "assistant"; content?: string; toolCalls?: readonly ToolCall[] }>
  | Readonly<{ role: "tool"; name: string; toolCallId?: string; output: unknown }>;

export type ModelRequest = Readonly<{
  messages: readonly AgentMessage[];
  tools: readonly ToolDefinition[];
}>;

export type ModelResponse = Readonly<{
  text?: string;
  toolCalls?: readonly ToolCall[];
}>;

export interface Model {
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export type AgentRunResult = Readonly<{
  text: string;
  steps: number;
  messages: readonly AgentMessage[];
}>;
