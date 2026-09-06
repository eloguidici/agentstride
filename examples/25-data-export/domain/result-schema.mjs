import { z } from "zod";

export const exportResultSchema = z.object({
  category: z.enum(["acknowledge", "export", "regulator-export"]),
  severity: z.enum(["low", "medium", "high"]),
  action: z.enum(["acknowledge", "proposeExport"]),
  source: z.string(),
  team: z.string(),
  fingerprint: z.string(),
  caseId: z.string().nullable(),
  exportProposalId: z.string().nullable(),
  subjectEmail: z.string(),
  summary: z.string(),
  requiresHumanApproval: z.boolean(),
  exported: z.boolean(),
});
