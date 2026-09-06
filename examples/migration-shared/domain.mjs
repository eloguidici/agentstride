import { z } from "zod";

/**
 * Pure domain layer for migration demos.
 * No AgentStride / Mastra / LangChain imports on purpose.
 */

export const findCustomerInputSchema = z.object({
  id: z.string().describe("Customer id"),
});

export const FIND_CUSTOMER_TOOL_NAME = "findCustomer";
export const FIND_CUSTOMER_TOOL_DESCRIPTION =
  "Find a customer by id and return their profile";

export const CUSTOMER_OPS_INSTRUCTIONS =
  "Help with customer operations. Use findCustomer when you need customer data. Be concise.";

export function findCustomerService(input) {
  const { id } = findCustomerInputSchema.parse(input);
  return {
    id,
    name: "Ada Lovelace",
    plan: "enterprise",
  };
}

export const domainFiles = [
  "domain.mjs",
];
