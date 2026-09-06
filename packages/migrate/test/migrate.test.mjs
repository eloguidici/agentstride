import assert from "node:assert/strict";
import test from "node:test";

import { defineTool } from "@agentstride/core";

import { toLangChainTool, toMastraTool } from "../dist/index.js";

test("exports portable tool metadata for migration wrappers", async () => {
  const tool = defineTool({
    name: "add",
    description: "Add numbers",
    execute: (input) => Number(input.a) + Number(input.b),
  });

  const mastra = toMastraTool(tool);
  const langchain = toLangChainTool(tool);

  assert.equal(mastra.name, "add");
  assert.equal(await langchain.execute({ a: 1, b: 2 }), 3);
});
