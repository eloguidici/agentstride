import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import { createLiveModel } from "../_shared/live-model.mjs";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id and return their profile",
  inputSchema: z.object({
    id: z.string().describe("Customer id"),
  }),
  execute({ id }) {
    return {
      id,
      name: "Ada Lovelace",
      plan: "enterprise",
    };
  },
});

const model = createLiveModel();

const agent = createAgent({
  model,
  instructions:
    "You help with customer lookups. Use findCustomer when you need customer data. Be concise.",
  tools: { findCustomer },
  maxSteps: 4,
  onEvent(event) {
    if (event.type === "tool:start" || event.type === "tool:end") {
      console.log(event.type, event.toolName);
    }
  },
});

const result = await agent.run("Look up customer 42 and tell me their name and plan.");

console.log("text:", result.text);
console.log("steps:", result.steps);
console.log("status:", result.status);
