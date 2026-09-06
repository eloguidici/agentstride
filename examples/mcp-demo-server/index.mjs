import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "agentstride-demo-mcp",
  version: "0.0.0",
});

server.tool(
  "echo",
  "Echo a message back",
  { message: z.string() },
  async ({ message }) => ({
    content: [{ type: "text", text: message }],
  }),
);

server.tool(
  "add",
  "Add two numbers and return the sum",
  {
    a: z.number(),
    b: z.number(),
  },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
