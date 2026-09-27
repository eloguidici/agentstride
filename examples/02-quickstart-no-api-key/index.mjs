import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({ id: z.string() }),
  execute: ({ id }) => ({ id, name: "Ada" }),
});

const model = {
  async generate(request) {
    const tool = request.tools?.[0];
    const toolDone = request.messages.some((m) => m.role === "tool");
    if (!toolDone && tool) {
      return { toolCalls: [{ name: "findCustomer", input: { id: "42" } }] };
    }
    const output = { summary: "Customer 42 (Ada) found successfully." };
    return {
      text: JSON.stringify(output),
      output,
    };
  },
};

const agent = createAgent({
  model,
  instructions: "Use tools when helpful.",
  tools: { findCustomer },
});

const run = await agent.run("Find customer 42", {
  output: z.object({ summary: z.string() }),
});

console.log("Status:", run.status);
console.log("Output:", run.output);
console.log("Duration:", `${run.durationMs}ms`);
