import { createAgent, defineTool } from "@agentstride/core";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  execute({ id }) {
    return { id, name: "Ada Lovelace" };
  },
});

let call = 0;

const demoModel = {
  async generate() {
    call += 1;

    if (call === 1) {
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
