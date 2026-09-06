import { z } from "zod";

export const changeResultSchema = z.object({
  category: z.enum(["routine", "elevated", "emergency"]),
  severity: z.enum(["low", "medium", "high"]),
  action: z.enum(["record", "proposeExecute"]),
  source: z.string(),
  team: z.string(),
  fingerprint: z.string(),
  changeRecordId: z.string().nullable(),
  executeProposalId: z.string().nullable(),
  summary: z.string(),
  requiresHumanApproval: z.boolean(),
  executed: z.boolean(),
});
