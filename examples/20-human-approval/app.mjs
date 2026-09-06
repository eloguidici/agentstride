#!/usr/bin/env node
/**
 * Offline demo: agent proposes → human approves → domain grants once.
 */

import {
  createApprovalReceptionist,
  runApprovalReceptionist,
} from "./agents/receptionist.mjs";
import { resetAuditLog, listAuditEntries } from "./domain/audit-service.mjs";
import {
  findCustomerService,
  resetCustomerStore,
} from "./domain/customer-service.mjs";
import {
  approveProposedAction,
  resetProposalStore,
} from "./domain/proposal-service.mjs";
import { createFakeApprovalModel } from "./fake-model.mjs";

resetCustomerStore();
resetProposalStore();
resetAuditLog();

const receptionist = createApprovalReceptionist(createFakeApprovalModel());
const context = {
  tenantId: "acme",
  userId: "op-support-1",
  requestId: "req-demo-1",
  roles: ["support"],
};

const run = await runApprovalReceptionist(
  receptionist,
  "Customer ACME needs production access.",
  { context },
);

console.log("agent decision:", run.output);
console.log("customer before approval:", findCustomerService("ACME"));

const approval = approveProposedAction({
  proposalId: run.output.proposalId,
  approvedBy: "admin-jane",
  roles: ["admin"],
});

console.log("approval:", {
  duplicate: approval.duplicate,
  status: approval.proposal.status,
  execution: approval.execution,
});
console.log("customer after approval:", findCustomerService("ACME"));
console.log(
  "audit:",
  listAuditEntries().map((e) => `${e.type} by ${e.actor}`),
);
