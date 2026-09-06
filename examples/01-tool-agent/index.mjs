import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({
    id: z.string(),
  }),
  execute({ id }) {
    return { id, name: "Ada Lovelace" };
  },
});

let call = 0;

const demoModel = {
  async generate(request) {
    call += 1;

    if (call === 1) {
      console.log(
        "tool parameters passed to model:",
        JSON.stringify(request.tools[0]?.parameters, null, 2),
      );

      return {
        toolCalls: [
          {
            id: "demo-call",
            name: "findCustomer",
            input: { id: "42" },
          },
        ],
      };
    }

    return { text: "Customer found: Ada Lovelace" };
  },
};

const agent = createAgent({
  model: demoModel,
  instructions: "Help with customer operations.",
  tools: { findCustomer },
});

const result = await agent.run("Find customer 42");

console.log(result.text);
