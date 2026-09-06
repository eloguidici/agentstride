import { z } from "zod";

export const supportResultSchema = z.object({
  decision: z.enum([
    "ticket-created",
    "needs-human-approval",
    "customer-not-found",
    "permission-denied",
    "info-only",
  ]),
  risk: z.enum(["low", "medium", "high"]),
  customerId: z.string().nullable(),
  caseId: z.string().nullable(),
  summary: z.string(),
  requiresHumanApproval: z.boolean(),
});
