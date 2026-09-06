import assert from "node:assert/strict";
import test from "node:test";

import { createInMemoryMemory } from "../dist/index.js";

test("stores and loads thread messages", async () => {
  const memory = createInMemoryMemory();
  await memory.save("t1", [
    { role: "user", content: "hi" },
    { role: "assistant", content: "hello" },
    { role: "tool", name: "x", output: 1 },
  ]);

  const loaded = await memory.load("t1");
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0]?.role, "user");
});
