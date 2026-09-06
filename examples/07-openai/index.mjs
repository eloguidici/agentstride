import { createAgent } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";

const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Set OPENROUTER_API_KEY or OPENAI_API_KEY to run this example.");
  process.exit(1);
}

const usingOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);

const agent = createAgent({
  model: createOpenAIModel({
    apiKey,
    model:
      process.env.OPENROUTER_MODEL ??
      process.env.OPENAI_MODEL ??
      "gpt-4o-mini",
    baseUrl: usingOpenRouter
      ? "https://openrouter.ai/api/v1"
      : process.env.OPENAI_BASE_URL,
    headers: usingOpenRouter
      ? {
          "HTTP-Referer": "https://github.com/eloguidici/agentstride",
          "X-Title": "AgentStride",
        }
      : undefined,
  }),
  instructions: "Reply in one short sentence.",
});

const result = await agent.run("What is AgentStride in one sentence?");
console.log(result.text);
console.log("run:", result.id, result.status);
