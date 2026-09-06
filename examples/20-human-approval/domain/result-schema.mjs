import { z } from "zod";

export const approvalResultSchema = z.object({
  decision: z.enum([
    "needs-human-approval",
    "customer-not-found",
    "info-only",
    "permission-denied",
  ]),
  risk: z.enum(["low", "medium", "high"]),
  customerId: z.string().nullable(),
  proposalId: z.string().nullable(),
  summary: z.string(),
  requiresHumanApproval: z.boolean(),
  /** Agent must never claim execution before external approval. */
  accessGranted: z.boolean(),
});
