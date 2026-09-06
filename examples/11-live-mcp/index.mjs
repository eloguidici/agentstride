import { createAgent } from "@agentstride/core";
import { connectMcpStdio } from "@agentstride/mcp";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createLiveModel } from "../_shared/live-model.mjs";

const demoServer = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../mcp-demo-server/index.mjs",
);

const mcp = await connectMcpStdio({
  command: process.execPath,
  args: [demoServer],
  allow: ["echo", "add"],
});

try {
  const tools = await mcp.tools();
  const model = createLiveModel();

  const agent = createAgent({
    model,
    instructions:
      "You can use echo and add tools from MCP. Prefer tools for math. Be concise.",
    tools,
    maxSteps: 4,
    onEvent(event) {
      if (event.type === "tool:start") {
        console.log(event.type, event.toolName);
      }
    },
  });

  const result = await agent.run("Use the add tool to compute 19 + 23, then tell me the sum.");
  console.log("text:", result.text);
  console.log("steps:", result.steps);
  console.log("status:", result.status);
} finally {
  await mcp.close();
}
