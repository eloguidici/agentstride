# @agentstride/mcp

Connect AgentStride agents to MCP servers without putting MCP inside core.

```ts
import { connectMcpStdio } from "@agentstride/mcp";

const mcp = await connectMcpStdio({
  command: "node",
  args: ["./examples/mcp-demo-server/index.mjs"],
  allow: ["echo", "add"],
});

const agent = createAgent({
  model,
  tools: await mcp.tools(),
});
```

Also exports `createMcpToolBridge()` for manually shaped tools.

This package is unrelated to any personal MCP servers outside the repository.
Use the bundled `examples/mcp-demo-server` for local demos.
