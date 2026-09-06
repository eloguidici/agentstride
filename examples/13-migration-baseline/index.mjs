import { createAgent, defineTool } from "@agentstride/core";
import { toMastraToolConfig, toLangChainToolConfig } from "@agentstride/migrate";

import {
  CUSTOMER_OPS_INSTRUCTIONS,
  FIND_CUSTOMER_TOOL_DESCRIPTION,
  FIND_CUSTOMER_TOOL_NAME,
  findCustomerInputSchema,
  findCustomerService,
} from "../migration-shared/domain.mjs";
import { measureReuse, printReuseReport } from "../migration-shared/measure.mjs";

const findCustomer = defineTool({
  name: FIND_CUSTOMER_TOOL_NAME,
  description: FIND_CUSTOMER_TOOL_DESCRIPTION,
  inputSchema: findCustomerInputSchema,
  execute: (input) => findCustomerService(input),
});

let call = 0;
const model = {
  async generate() {
    call += 1;
    if (call === 1) {
      return {
        toolCalls: [{ name: FIND_CUSTOMER_TOOL_NAME, input: { id: "42" } }],
      };
    }
    return { text: "Customer 42 is Ada Lovelace on enterprise." };
  },
};

const agent = createAgent({
  model,
  instructions: CUSTOMER_OPS_INSTRUCTIONS,
  tools: { findCustomer },
});

const result = await agent.run("Find customer 42");
console.log("agentstride:", result.text);

const mastraConfig = toMastraToolConfig(findCustomer);
const langchainConfig = toLangChainToolConfig(findCustomer);
console.log("portable mastra id:", mastraConfig.id);
console.log("portable langchain name:", langchainConfig.name);

printReuseReport(
  measureReuse({
    label: "agentstride-baseline",
    sharedFiles: ["domain.mjs"],
    frameworkFiles: ["../13-migration-baseline/index.mjs"],
  }),
);
