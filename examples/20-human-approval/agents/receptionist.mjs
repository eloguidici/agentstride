import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import {
  CustomerNotFoundError,
  findCustomerService,
} from "../domain/customer-service.mjs";
import {
  ACTIONS,
  assertCanPerform,
} from "../domain/permissions.mjs";
import {
  PROPOSAL_TYPES,
  createProposedAction,
} from "../domain/proposal-service.mjs";
import { approvalResultSchema } from "../domain/result-schema.mjs";

function rolesFrom(context) {
  return Array.isArray(context.roles) ? context.roles : [];
}

/**
 * Tools the agent may use. Intentionally NO approve/grant tools.
 */
export function createApprovalTools() {
  const findCustomer = defineTool({
    name: "findCustomer",
    description: "Look up a customer by id",
    inputSchema: z.object({ customerId: z.string() }),
    execute({ customerId }, context) {
      assertCanPerform(rolesFrom(context), ACTIONS.LOOKUP_CUSTOMER);
      try {
        return { found: true, customer: findCustomerService(customerId) };
      } catch (error) {
        if (error instanceof CustomerNotFoundError) {
          return { found: false, customerId: error.customerId };
        }
        throw error;
      }
    },
  });

  const proposeProductionAccess = defineTool({
    name: "proposeProductionAccess",
    description:
      "Create a pending production-access proposal for human approval. Does not grant access.",
    inputSchema: z.object({
      customerId: z.string(),
      reason: z.string(),
    }),
    execute({ customerId, reason }, context) {
      assertCanPerform(rolesFrom(context), ACTIONS.PROPOSE_PRODUCTION_ACCESS);
      findCustomerService(customerId);
      const proposal = createProposedAction({
        type: PROPOSAL_TYPES.GRANT_PRODUCTION_ACCESS,
        parameters: { customerId },
        reason,
        requestedBy: String(context.userId ?? "unknown"),
        tenantId: String(context.tenantId ?? "unknown"),
        requestId: String(context.requestId ?? "unknown"),
        agentRunId:
          typeof context.agentRunId === "string" ? context.agentRunId : null,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });
      return {
        proposalId: proposal.id,
        status: proposal.status,
        accessGranted: false,
      };
    },
  });

  return { findCustomer, proposeProductionAccess };
}

export function createApprovalReceptionist(model, options = {}) {
  const tools = createApprovalTools();
  const agent = createAgent({
    model,
    instructions: [
      "You are ReceptionistAgent for enterprise support.",
      "For production access requests: look up the customer and call proposeProductionAccess.",
      "Never grant production access. Never claim access was granted.",
      "There is no approve or grant tool — humans approve outside this agent.",
      "Return structured output matching the schema.",
    ].join(" "),
    tools,
    maxSteps: options.maxSteps ?? 6,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
  });

  return { agent, tools, outputSchema: approvalResultSchema };
}

export async function runApprovalReceptionist(receptionist, input, runOptions = {}) {
  return receptionist.agent.run(input, {
    ...runOptions,
    output: receptionist.outputSchema,
  });
}
