import type { Tool } from "@agentstride/core";
import type { ZodType } from "zod";

export type PortableTool = Readonly<{
  name: string;
  description: string;
  parameters?: Readonly<Record<string, unknown>>;
  inputSchema?: ZodType;
  execute: (
    input: unknown,
    context?: Readonly<Record<string, unknown>>,
  ) => Promise<unknown> | unknown;
}>;

export type MastraToolConfig = Readonly<{
  id: string;
  description: string;
  inputSchema?: ZodType;
  execute: (input: unknown) => Promise<unknown> | unknown;
}>;

export type LangChainToolConfig = Readonly<{
  name: string;
  description: string;
  schema?: ZodType;
  func: (input: unknown) => Promise<string>;
}>;

export function toPortableTool(
  tool: Tool<unknown, unknown> & { inputSchema?: ZodType },
): PortableTool {
  return {
    name: tool.name,
    description: tool.description,
    ...(tool.parameters !== undefined ? { parameters: tool.parameters } : {}),
    ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
    execute: (input, context = {}) => tool.execute(input, context),
  };
}

/**
 * Config shape compatible with Mastra's createTool({...}).
 */
export function toMastraToolConfig(
  tool: Tool<unknown, unknown> & { inputSchema?: ZodType },
): MastraToolConfig {
  const portable = toPortableTool(tool);
  return {
    id: portable.name,
    description: portable.description,
    ...(portable.inputSchema !== undefined
      ? { inputSchema: portable.inputSchema }
      : {}),
    execute: (input) => portable.execute(input, {}),
  };
}

/**
 * Config shape compatible with LangChain DynamicStructuredTool.
 */
export function toLangChainToolConfig(
  tool: Tool<unknown, unknown> & { inputSchema?: ZodType },
): LangChainToolConfig {
  const portable = toPortableTool(tool);
  return {
    name: portable.name,
    description: portable.description,
    ...(portable.inputSchema !== undefined ? { schema: portable.inputSchema } : {}),
    func: async (input) => {
      const output = await portable.execute(input, {});
      return typeof output === "string" ? output : JSON.stringify(output);
    },
  };
}

/** @deprecated Prefer toMastraToolConfig */
export function toMastraTool(
  tool: Tool<unknown, unknown> & { inputSchema?: ZodType },
): PortableTool {
  return toPortableTool(tool);
}

/** @deprecated Prefer toLangChainToolConfig */
export function toLangChainTool(
  tool: Tool<unknown, unknown> & { inputSchema?: ZodType },
): PortableTool {
  return toPortableTool(tool);
}
