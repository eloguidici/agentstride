import { createAgent, defineTool } from "@agentstride/core";
import {
  createInMemoryRetriever,
  formatRetrievedContext,
} from "@agentstride/rag";
import { z } from "zod";

import { findCustomerService } from "../domain/customer-service.mjs";
import { KNOWLEDGE_DOCUMENTS } from "../domain/knowledge.mjs";
import {
  ACTIONS,
  assertCanPerform,
} from "../domain/permissions.mjs";
import { assessProductionAccessRequest } from "../domain/security-service.mjs";

const retriever = createInMemoryRetriever(KNOWLEDGE_DOCUMENTS);

function rolesFrom(context) {
  return Array.isArray(context.roles) ? context.roles : [];
}

export function createSecurityTools() {
  const assessSecurity = defineTool({
    name: "assessSecurity",
    description:
      "Assess security risk for a customer access request. Never grants production access.",
    inputSchema: z.object({
      customerId: z.string(),
      requestText: z.string(),
    }),
    execute({ customerId, requestText }, context) {
      assertCanPerform(rolesFrom(context), ACTIONS.ASSESS_SECURITY);
      const customer = findCustomerService(customerId);
      return assessProductionAccessRequest({ customer, requestText });
    },
  });

  const searchKnowledge = defineTool({
    name: "searchKnowledge",
    description: "Search internal security and access policies",
    inputSchema: z.object({
      query: z.string(),
    }),
    async execute({ query }, context) {
      assertCanPerform(rolesFrom(context), ACTIONS.ASSESS_SECURITY);
      const signal = context.abortSignal;
      if (signal?.aborted) {
        throw signal.reason instanceof Error
          ? signal.reason
          : new Error("searchKnowledge aborted");
      }
      const docs = await retriever.retrieve(query, { limit: 3 });
      return {
        context: formatRetrievedContext(docs),
        ids: docs.map((d) => d.id),
      };
    },
  });

  return { assessSecurity, searchKnowledge };
}

/**
 * Security specialist agent. Exposed to Receptionist via asAgentTool.
 */
export function createSecurityAgent(model, options = {}) {
  const tools = createSecurityTools();
  return createAgent({
    model,
    instructions:
      "You are the security specialist. Use assessSecurity and searchKnowledge. Never grant production access. Recommend human approval when risk is high. Be concise.",
    tools,
    maxSteps: 4,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
  });
}
