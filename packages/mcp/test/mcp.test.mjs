import assert from "node:assert/strict";
import test from "node:test";

import { createMcpToolBridge } from "../dist/index.js";

test("maps MCP-like tools into AgentStride tools", async () => {
  const bridge = createMcpToolBridge([
    {
      name: "ping",
      description: "Ping",
      execute: () => "pong",
    },
  ]);

  const tools = bridge.tools();
  assert.equal(await tools.ping?.execute({}, {}), "pong");
});
