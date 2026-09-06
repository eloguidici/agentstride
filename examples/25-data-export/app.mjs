#!/usr/bin/env node
import { createExportAgent, runExportGate } from "./agents/export-agent.mjs";
import {
  approveExportProposal,
  caseCount,
  resetExportStores,
} from "./domain/export-service.mjs";
import { createFakeExportModel } from "./fake-model.mjs";

resetExportStores();

const agent = createExportAgent(createFakeExportModel("idvault-export"));
const result = await runExportGate(agent, "Handle Velum Grid SAR export", {
  context: {
    tenantId: "velum-grid",
    userId: "privacy-bot",
    requestId: "req-sar-1",
    roles: ["support"],
  },
});

console.log("data-export:", result.output);
console.log("cases:", caseCount());

const approval = approveExportProposal({
  proposalId: result.output.exportProposalId,
  approvedBy: "privacy-lead-ada",
  roles: ["privacy-officer"],
});
console.log("export approval:", {
  duplicate: approval.duplicate,
  exported: approval.proposal.exported,
});
