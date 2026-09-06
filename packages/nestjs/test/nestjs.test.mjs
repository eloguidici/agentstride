import assert from "node:assert/strict";
import test from "node:test";

import { AgentStrideModule } from "../dist/index.js";

test("forRoot creates a Nest dynamic module with an agent provider", () => {
  const model = {
    async generate() {
      return { text: "hi" };
    },
  };

  const dynamic = AgentStrideModule.forRoot({ model });
  assert.equal(dynamic.module, AgentStrideModule);
  assert.ok((dynamic.providers?.length ?? 0) >= 2);
});
