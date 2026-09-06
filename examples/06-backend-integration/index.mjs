import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

// Shaped like a normal backend service call, not a chatbot UI.
async function createCase({ customerId, reason }, context) {
  return {
    caseId: "CASE-1001",
    customerId,
    reason,
    tenantId: context.tenantId,
  };
}

const openCase = defineTool({
  name: "openCase",
  description: "Open an operational case",
  inputSchema: z.object({
    customerId: z.string(),
    reason: z.string(),
  }),
  execute: createCase,
});

let call = 0;
const model = {
  async generate() {
    call += 1;
    if (call === 1) {
      return {
        toolCalls: [
          {
            name: "openCase",
            input: { customerId: "42", reason: "billing discrepancy" },
          },
        ],
      };
    }
    return { text: "Opened CASE-1001" };
  },
};

const agent = createAgent({
  model,
  tools: { openCase },
  allowedTools: ["openCase"],
  hooks: {
    beforeTool: ({ toolCall, context }) => {
      if (!context.tenantId) {
        throw new Error("tenantId required");
      }
      console.log("approving tool", toolCall?.name);
    },
  },
});

const result = await agent.run("Open a billing case for customer 42", {
  context: { tenantId: "acme" },
});

console.log(result.text);
