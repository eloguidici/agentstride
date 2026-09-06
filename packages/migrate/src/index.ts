import type { Tool } from "@agentstride/core";

export type PortableTool = Readonly<{
  name: string;
  description: string;
  parameters?: Readonly<Record<string, unknown>>;
  execute: (input: unknown, context?: Readonly<Record<string, unknown>>) => Promise<unknown> | unknown;
}>;

export function toPortableTool(tool: Tool<unknown, unknown>): PortableTool {
  return {
    name: tool.name,
    description: tool.description,
    ...(tool.parameters !== undefined ? { parameters: tool.parameters } : {}),
    execute: (input, context = {}) => tool.execute(input, context),
  };
}

/**
 * Shape that is easy to wrap with Mastra's tool helper in application code.
 */
export function toMastraTool(tool: Tool<unknown, unknown>): PortableTool {
  return toPortableTool(tool);
}

/**
 * Shape that is easy to wrap with LangChain's DynamicStructuredTool in application code.
 */
export function toLangChainTool(tool: Tool<unknown, unknown>): PortableTool {
  return toPortableTool(tool);
}
