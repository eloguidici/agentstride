import { createAgent } from "@agentstride/core";

const model = {
  async generate() {
    return { text: "Hello from a tool-free agent." };
  },
};

const agent = createAgent({
  model,
  instructions: "Be concise.",
});

const result = await agent.run("Say hello");
console.log(result.text);
console.log("run:", result.id, result.status, `${result.durationMs}ms`);
