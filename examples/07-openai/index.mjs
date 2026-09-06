import { createAgent } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY to run this example.");
  process.exit(1);
}

const agent = createAgent({
  model: createOpenAIModel({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  }),
  instructions: "Reply in one short sentence.",
});

const result = await agent.run("What is AgentStride in one sentence?");
console.log(result.text);
