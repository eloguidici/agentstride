import { defineTool } from "@agentstride/core";
import { toLangChainToolConfig } from "@agentstride/migrate";

import {
  FIND_CUSTOMER_TOOL_DESCRIPTION,
  FIND_CUSTOMER_TOOL_NAME,
  findCustomerInputSchema,
  findCustomerService,
} from "../migration-shared/domain.mjs";
import { measureReuse, printReuseReport } from "../migration-shared/measure.mjs";

/**
 * Framework-specific adapter only.
 * Domain logic stays in migration-shared/domain.mjs.
 *
 * Mirrors LangChain DynamicStructuredTool({ name, description, schema, func }).
 */
const agentStrideTool = defineTool({
  name: FIND_CUSTOMER_TOOL_NAME,
  description: FIND_CUSTOMER_TOOL_DESCRIPTION,
  inputSchema: findCustomerInputSchema,
  execute: (input) => findCustomerService(input),
});

const langchainConfig = toLangChainToolConfig(agentStrideTool);

async function buildLangChainTool(config) {
  try {
    const mod = await import("@langchain/core/tools");
    if (mod.DynamicStructuredTool) {
      return new mod.DynamicStructuredTool({
        name: config.name,
        description: config.description,
        schema: config.schema,
        func: config.func,
      });
    }
  } catch {
    // optional dependency
  }

  return {
    name: config.name,
    description: config.description,
    schema: config.schema,
    invoke: async (input) => config.func(input),
    __shim: "langchain-DynamicStructuredTool-compatible",
  };
}

const tool = await buildLangChainTool(langchainConfig);
const output = tool.invoke
  ? await tool.invoke({ id: "42" })
  : await tool.func({ id: "42" });

console.log("langchain-tool-output:", output);
console.log(
  "langchain-source:",
  tool.__shim
    ? "shim (install @langchain/core to use real DynamicStructuredTool)"
    : "real @langchain/core",
);

printReuseReport(
  measureReuse({
    label: "migrate-langchain",
    sharedFiles: ["domain.mjs"],
    frameworkFiles: ["../15-migrate-langchain/index.mjs"],
  }),
);
