import { defineTool } from "@agentstride/core";
import { toMastraToolConfig } from "@agentstride/migrate";

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
 * This mirrors Mastra's createTool({ id, description, inputSchema, execute })
 * without requiring @mastra/core to be installed for the demo to run.
 * If @mastra/core is available, we prefer its createTool.
 */
const agentStrideTool = defineTool({
  name: FIND_CUSTOMER_TOOL_NAME,
  description: FIND_CUSTOMER_TOOL_DESCRIPTION,
  inputSchema: findCustomerInputSchema,
  execute: (input) => findCustomerService(input),
});

const mastraToolConfig = toMastraToolConfig(agentStrideTool);

async function buildMastraTool(config) {
  try {
    const mod = await import("@mastra/core/tools");
    if (typeof mod.createTool === "function") {
      return mod.createTool({
        id: config.id,
        description: config.description,
        inputSchema: config.inputSchema,
        execute: async (inputData) => config.execute(inputData),
      });
    }
  } catch {
    // optional dependency
  }

  return {
    id: config.id,
    description: config.description,
    inputSchema: config.inputSchema,
    execute: config.execute,
    __shim: "mastra-createTool-compatible",
  };
}

const mastraTool = await buildMastraTool(mastraToolConfig);
const output = await mastraTool.execute({ id: "42" });

console.log("mastra-tool-output:", output);
console.log(
  "mastra-source:",
  mastraTool.__shim ? "shim (install @mastra/core to use real createTool)" : "real @mastra/core",
);

printReuseReport(
  measureReuse({
    label: "migrate-mastra",
    sharedFiles: ["domain.mjs"],
    frameworkFiles: ["../14-migrate-mastra/index.mjs"],
  }),
);
