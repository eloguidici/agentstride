import {
  asAgentTool,
  createAgent,
  defineTool,
} from "@agentstride/core";
import { z } from "zod";

import { findCustomerService, CustomerNotFoundError } from "../domain/customer-service.mjs";
import {
  ACTIONS,
  assertCanPerform,
} from "../domain/permissions.mjs";
import { supportResultSchema } from "../domain/result-schema.mjs";
import { createSupportCaseService } from "../domain/support-case-service.mjs";
import { createSecurityAgent } from "./security-agent.mjs";

function rolesFrom(context) {
  return Array.isArray(context.roles) ? context.roles : [];
}

export function createReceptionistTools(securityAgent) {
  const findCustomer = defineTool({
    name: "findCustomer",
    description: "Look up a customer profile by id (e.g. ACME)",
    inputSchema: z.object({
      customerId: z.string(),
    }),
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

  const askSecurity = asAgentTool(securityAgent, {
    name: "askSecurity",
    description:
      "Ask the security specialist about access risk and policy for a request",
  });

  const createSupportCase = defineTool({
    name: "createSupportCase",
    description:
      "Create a support case for the customer. Does not grant production access.",
    inputSchema: z.object({
      customerId: z.string(),
      summary: z.string(),
    }),
    execute({ customerId, summary }, context) {
      assertCanPerform(rolesFrom(context), ACTIONS.CREATE_SUPPORT_CASE);
      return createSupportCaseService({
        customerId,
        summary,
        tenantId: String(context.tenantId ?? "unknown"),
        requestId: String(context.requestId ?? "unknown"),
        openedBy: String(context.userId ?? "unknown"),
      });
    },
  });

  /**
   * Cooperative cancellation demo: respects context.abortSignal.
   * Not required for the happy path; used in cancellation tests.
   */
  const slowAuditPing = defineTool({
    name: "slowAuditPing",
    description: "Internal slow probe that honors abortSignal (for cancellation demos)",
    inputSchema: z.object({
      delayMs: z.number().int().positive().default(500),
    }),
    async execute({ delayMs }, context) {
      const signal = context.abortSignal;
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, delayMs);
        signal?.addEventListener(
          "abort",
          () => {
            clearTimeout(timer);
            reject(
              signal.reason instanceof Error
                ? signal.reason
                : new Error("slowAuditPing aborted"),
            );
          },
          { once: true },
        );
      });
      return { ok: true };
    },
  });

  return { findCustomer, askSecurity, createSupportCase, slowAuditPing };
}

/**
 * ReceptionistAgent — first routing layer via tools / AgentLike, not a bus.
 */
export function createReceptionistAgent(model, options = {}) {
  const securityModel = options.securityModel ?? model;
  const securityAgent = createSecurityAgent(securityModel);
  const tools = createReceptionistTools(securityAgent);

  const agent = createAgent({
    model,
    instructions: [
      "You are ReceptionistAgent for internal enterprise support.",
      "Delegate security questions with askSecurity.",
      "Use findCustomer for account lookup.",
      "Use createSupportCase when a ticket is warranted and the operator is allowed.",
      "Never grant production access. If production access is requested, conclude that human/security approval is required.",
      "Return a final structured result matching the output schema.",
    ].join(" "),
    tools,
    maxSteps: options.maxSteps ?? 8,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
    ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
  });

  return {
    agent,
    securityAgent,
    tools,
    outputSchema: supportResultSchema,
  };
}

export async function runReceptionist(receptionist, input, runOptions = {}) {
  return receptionist.agent.run(input, {
    ...runOptions,
    output: receptionist.outputSchema,
  });
}
