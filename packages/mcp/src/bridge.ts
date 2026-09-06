import { defineTool, type JsonSchemaObject, type Tool } from "@agentstride/core";

/**
 * Minimal MCP-shaped tool descriptor.
 * Use with createMcpToolBridge, or prefer connectMcpStdio for a real server.
 */
export type McpToolLike = Readonly<{
  name: string;
  description: string;
  inputSchema?: JsonSchemaObject;
  execute: (input: unknown) => Promise<unknown> | unknown;
}>;

export type McpToolBridge = Readonly<{
  tools(): Record<string, Tool<unknown, unknown>>;
}>;

export function createMcpToolBridge(
  mcpTools: readonly McpToolLike[],
): McpToolBridge {
  const mapped: Record<string, Tool<unknown, unknown>> = {};

  for (const mcpTool of mcpTools) {
    mapped[mcpTool.name] = defineTool({
      name: mcpTool.name,
      description: mcpTool.description,
      ...(mcpTool.inputSchema !== undefined
        ? { parameters: mcpTool.inputSchema }
        : {}),
      execute: (input) => mcpTool.execute(input),
    });
  }

  return {
    tools() {
      return { ...mapped };
    },
  };
}
