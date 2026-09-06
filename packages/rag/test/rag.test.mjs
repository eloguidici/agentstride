import assert from "node:assert/strict";
import test from "node:test";

import { createInMemoryRetriever } from "../dist/index.js";

test("ranks documents by simple term overlap", async () => {
  const retriever = createInMemoryRetriever([
    { id: "1", text: "Vacation policy allows 20 days" },
    { id: "2", text: "Laptop request process" },
  ]);

  const docs = await retriever.retrieve("vacation days");
  assert.equal(docs[0]?.id, "1");
});
