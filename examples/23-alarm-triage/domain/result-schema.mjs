import { z } from "zod";

export const triageResultSchema = z.object({
  category: z.enum(["noise", "warning", "incident"]),
  severity: z.enum(["low", "medium", "high"]),
  action: z.enum(["drop", "ticket", "page"]),
  source: z.string(),
  team: z.string(),
  fingerprint: z.string(),
  ticketId: z.string().nullable(),
  pageProposalId: z.string().nullable(),
  summary: z.string(),
  requiresHumanApproval: z.boolean(),
  /** True only after external page approval — agent must keep this false. */
  paged: z.boolean(),
});
