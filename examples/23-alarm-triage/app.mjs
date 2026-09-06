#!/usr/bin/env node
import { createTriageAgent, runTriage } from "./agents/triage-agent.mjs";
import {
  approvePageProposal,
  listTickets,
  resetAlarmStores,
  ticketCount,
} from "./domain/incident-service.mjs";
import { createFakeTriageModel } from "./fake-model.mjs";

resetAlarmStores();

const context = {
  tenantId: "velum-grid",
  userId: "triage-bot",
  requestId: "req-vg-1",
  roles: ["sre"],
};

const agent = createTriageAgent(createFakeTriageModel("pulsebeat-crash"));
const result = await runTriage(
  agent,
  "Triage raw pulsebeat crash alarm for Velum Grid",
  { context },
);

console.log("triage:", result.output);
console.log("tickets:", ticketCount(), listTickets());

const approval = approvePageProposal({
  proposalId: result.output.pageProposalId,
  approvedBy: "sre-lead-mira",
  roles: ["sre-approver"],
});
console.log("page approval:", {
  duplicate: approval.duplicate,
  paged: approval.proposal.paged,
});
