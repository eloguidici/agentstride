import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { defineTool, type JsonSchemaObject, type Tool } from "@agentstride/core";

import { createMcpToolBridge, type McpToolLike } from "./bridge.js";

export type ConnectMcpStdioOptions = Readonly<{
  command: string;
  args?: readonly string[];
  cwd?: string;
  env?: Readonly<Record<string, string>>;
  /** Only expose these tool names. If omitted, all tools are mapped. */
  allow?: readonly string[];
}>;

export type McpSession = Readonly<{
  client: Client;
  listToolNames(): Promise<string[]>;
  tools(options?: { allow?: readonly string[] }): Promise<
    Record<string, Tool<unknown, unknown>>
  >;
  close(): Promise<void>;
}>;

export async function connectMcpStdio(
  options: ConnectMcpStdioOptions,
): Promise<McpSession> {
  const transport = new StdioClientTransport({
    command: options.command,
    args: [...(options.args ?? [])],
    ...(options.cwd !== undefined ? { cwd: options.cwd } : {}),
    ...(options.env !== undefined ? { env: { ...options.env } } : {}),
  });

  const client = new Client({
    name: "agentstride",
    version: "0.0.0",
  });

  await client.connect(transport);

  const session: McpSession = {
    client,
    async listToolNames() {
      const listed = await client.listTools();
      return listed.tools.map((tool) => tool.name);
    },
    async tools(toolOptions = {}) {
      const allow = toolOptions.allow ?? options.allow;
      const listed = await client.listTools();
      const selected = listed.tools.filter((tool) =>
        allow ? allow.includes(tool.name) : true,
      );

      const mapped: McpToolLike[] = selected.map((tool) => ({
        name: tool.name,
        description: tool.description ?? tool.name,
        ...(tool.inputSchema
          ? { inputSchema: tool.inputSchema as JsonSchemaObject }
          : {}),
        execute: async (input) => {
          const result = await client.callTool({
            name: tool.name,
            arguments:
              input && typeof input === "object"
                ? (input as Record<string, unknown>)
                : {},
          });
          return unwrapMcpResult(result);
        },
      }));

      return createMcpToolBridge(mapped).tools();
    },
    async close() {
      await client.close();
    },
  };

  return session;
}

export function unwrapMcpResult(result: unknown): unknown {
  if (!result || typeof result !== "object") {
    return result;
  }

  const record = result as {
    content?: Array<{ type?: string; text?: string; json?: unknown }>;
    structuredContent?: unknown;
  };

  if (record.structuredContent !== undefined) {
    return record.structuredContent;
  }

  const content = record.content;
  if (!Array.isArray(content) || content.length === 0) {
    return result;
  }

  if (content.length === 1) {
    const item = content[0];
    if (item?.type === "text" && typeof item.text === "string") {
      return item.text;
    }
    if (item?.json !== undefined) {
      return item.json;
    }
  }

  return content
    .map((item) => {
      if (item?.type === "text") {
        return item.text ?? "";
      }
      return JSON.stringify(item);
    })
    .join("\n");
}

/** @deprecated Prefer connectMcpStdio().tools() for real MCP servers. */
export function mcpResultToToolOutput(result: unknown): unknown {
  return unwrapMcpResult(result);
}

export { createMcpToolBridge, defineTool };
export type { McpToolLike };
