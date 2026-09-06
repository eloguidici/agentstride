import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import { createSupportCaseService } from "../domain/support-case-service.mjs";

export function createIdempotentTools() {
  const createSupportCase = defineTool({
    name: "createSupportCase",
    description:
      "Create a support case. Safe to retry: same tenantId+requestId yields one case.",
    inputSchema: z.object({
      customerId: z.string(),
      summary: z.string(),
      idempotencyKey: z.string().optional(),
    }),
    async execute({ customerId, summary, idempotencyKey }, context) {
      return createSupportCaseService({
        customerId,
        summary,
        tenantId: String(context.tenantId ?? "unknown"),
        requestId: String(context.requestId ?? "unknown"),
        openedBy: String(context.userId ?? "unknown"),
        idempotencyKey,
      });
    },
  });

  return { createSupportCase };
}

export function createCaseAgent(model, options = {}) {
  const tools = createIdempotentTools();
  const agent = createAgent({
    model,
    instructions:
      "Open a support case when asked. Retries are safe; do not invent new request ids.",
    tools,
    maxSteps: options.maxSteps ?? 4,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
  });
  return { agent, tools };
}
