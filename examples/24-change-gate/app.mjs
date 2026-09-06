#!/usr/bin/env node
import { createChangeAgent, runChangeGate } from "./agents/change-agent.mjs";
import {
  approveExecuteProposal,
  changeCount,
  listChanges,
  resetChangeStores,
} from "./domain/change-service.mjs";
import { createFakeChangeModel } from "./fake-model.mjs";

resetChangeStores();

const context = {
  tenantId: "velum-grid",
  userId: "change-bot",
  requestId: "req-chg-1",
  roles: ["sre"],
};

const agent = createChangeAgent(createFakeChangeModel("shipyard-hotfix"));
const result = await runChangeGate(
  agent,
  "Gate Velum Grid shipyard hotfix change",
  { context },
);

console.log("change-gate:", result.output);
console.log("records:", changeCount(), listChanges());

const approval = approveExecuteProposal({
  proposalId: result.output.executeProposalId,
  approvedBy: "change-lead-nova",
  roles: ["change-approver"],
});
console.log("execute approval:", {
  duplicate: approval.duplicate,
  executed: approval.proposal.executed,
});
