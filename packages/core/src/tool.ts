import type { AgentContext } from "./types.js";

export interface Tool<TInput = unknown, TOutput = unknown> {
  readonly name: string;
  readonly description: string;
  execute(input: TInput, context: AgentContext): Promise<TOutput> | TOutput;
}

export function defineTool<TInput, TOutput>(
  tool: Tool<TInput, TOutput>,
): Tool<TInput, TOutput> {
  return tool;
}
