import assert from "node:assert/strict";
import test from "node:test";

import { createRemoteAgent } from "../dist/index.js";

test("createRemoteAgent posts to the configured endpoint", async () => {
  const calls = [];

  const agent = createRemoteAgent({
    url: "https://example.test/agent",
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({
          id: "run_1",
          status: "completed",
          text: "remote",
          steps: 1,
          messages: [],
          startedAt: 1,
          endedAt: 2,
          durationMs: 1,
          events: [],
        }),
        { status: 200 },
      );
    },
  });

  const result = await agent.run("hello");
  assert.equal(result.text, "remote");
  assert.equal(calls.length, 1);
});
