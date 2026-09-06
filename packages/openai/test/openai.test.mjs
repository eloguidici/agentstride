import assert from "node:assert/strict";
import test from "node:test";

import { createOpenAIModel } from "../dist/index.js";

test("createOpenAIModel maps chat completions through fetch", async () => {
  const model = createOpenAIModel({
    apiKey: "test-key",
    model: "gpt-4o-mini",
    baseUrl: "https://api.openai.com/v1",
    fetchImpl: async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      assert.equal(body.model, "gpt-4o-mini");
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "hello from openai" } }],
          usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
        }),
        { status: 200 },
      );
    },
  });

  const result = await model.generate({
    messages: [{ role: "user", content: "hi" }],
    tools: [],
  });

  assert.equal(result.text, "hello from openai");
  assert.equal(result.usage?.totalTokens, 5);
});
