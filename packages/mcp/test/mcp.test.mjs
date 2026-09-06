import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { connectMcpStdio, createMcpToolBridge, unwrapMcpResult } from "../dist/index.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const demoServer = resolve(root, "examples/mcp-demo-server/index.mjs");

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

test("unwraps MCP text content", () => {
  assert.equal(
    unwrapMcpResult({
      content: [{ type: "text", text: "hello" }],
    }),
    "hello",
  );
});

test("connects to the demo MCP server over stdio", async () => {
  const session = await connectMcpStdio({
    command: process.execPath,
    args: [demoServer],
    allow: ["echo", "add"],
  });

  try {
    const names = await session.listToolNames();
    assert.ok(names.includes("echo"));
    assert.ok(names.includes("add"));

    const tools = await session.tools();
    assert.equal(await tools.echo?.execute({ message: "hi" }, {}), "hi");
    assert.equal(await tools.add?.execute({ a: 2, b: 3 }, {}), "5");
  } finally {
    await session.close();
  }
});
