import assert from "node:assert/strict";
import test from "node:test";

import { defineTool } from "@agentstride/core";
import { z } from "zod";

import {
  toLangChainToolConfig,
  toMastraToolConfig,
  toPortableTool,
} from "../dist/index.js";

test("exports portable configs for Mastra and LangChain wrappers", async () => {
  const tool = defineTool({
    name: "add",
    description: "Add numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    execute: (input) => Number(input.a) + Number(input.b),
  });

  const portable = toPortableTool(tool);
  const mastra = toMastraToolConfig(tool);
  const langchain = toLangChainToolConfig(tool);

  assert.equal(portable.name, "add");
  assert.equal(mastra.id, "add");
  assert.equal(await mastra.execute({ a: 1, b: 2 }), 3);
  assert.equal(langchain.name, "add");
  assert.equal(await langchain.func({ a: 2, b: 5 }), "7");
});
