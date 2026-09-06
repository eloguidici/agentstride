import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  createApprovalReceptionist,
  createApprovalTools,
  runApprovalReceptionist,
} from "../agents/receptionist.mjs";
import { resetAuditLog, auditForProposal } from "../domain/audit-service.mjs";
import {
  findCustomerService,
  resetCustomerStore,
} from "../domain/customer-service.mjs";
import {
  approveProposedAction,
  getProposedAction,
  resetProposalStore,
} from "../domain/proposal-service.mjs";
import { createFakeApprovalModel } from "../fake-model.mjs";

const CONTEXT = {
  tenantId: "acme",
  userId: "op-support",
  requestId: "req-agent-1",
  roles: ["support"],
};

describe("approval receptionist behavior", () => {
  beforeEach(() => {
    resetCustomerStore();
    resetProposalStore();
    resetAuditLog();
  });

  it("sensitive request creates proposal only and does not grant", async () => {
    const receptionist = createApprovalReceptionist(
      createFakeApprovalModel("prod-access"),
    );
    const result = await runApprovalReceptionist(
      receptionist,
      "Customer ACME needs production access.",
      { context: CONTEXT },
    );

    assert.equal(result.status, "completed");
    assert.equal(result.output.decision, "needs-human-approval");
    assert.equal(result.output.requiresHumanApproval, true);
    assert.equal(result.output.accessGranted, false);
    assert.ok(result.output.proposalId);
    assert.equal(getProposedAction(result.output.proposalId).status, "pending");
    assert.equal(findCustomerService("ACME").productionAccess, "restricted");

    const tools = Object.keys(receptionist.tools);
    assert.ok(tools.includes("proposeProductionAccess"));
    assert.ok(!tools.includes("approveProposedAction"));
    assert.ok(!tools.includes("grantProductionAccess"));
    assert.ok(!tools.includes("approveProductionAccess"));
  });

  it("agent cannot call an approval shortcut tool", () => {
    const tools = createApprovalTools();
    assert.equal(tools.approveProposedAction, undefined);
    assert.equal(tools.grantProductionAccess, undefined);
    assert.deepEqual(Object.keys(tools).sort(), [
      "findCustomer",
      "proposeProductionAccess",
    ]);
  });

  it("structured result clearly says approval required", async () => {
    const receptionist = createApprovalReceptionist(
      createFakeApprovalModel("prod-access"),
    );
    const result = await runApprovalReceptionist(
      receptionist,
      "ACME production access",
      { context: CONTEXT },
    );
    assert.equal(result.output.requiresHumanApproval, true);
    assert.equal(result.output.accessGranted, false);
    assert.match(result.output.summary, /approval|Proposed/i);
  });

  it("external approval after agent proposal grants once with audit", async () => {
    const events = [];
    const receptionist = createApprovalReceptionist(
      createFakeApprovalModel("prod-access"),
      { onEvent: (e) => events.push(e) },
    );
    const result = await runApprovalReceptionist(
      receptionist,
      "ACME needs production access",
      { context: CONTEXT },
    );

    const approval = approveProposedAction({
      proposalId: result.output.proposalId,
      approvedBy: "admin-1",
      roles: ["admin"],
    });
    assert.equal(approval.duplicate, false);
    assert.equal(findCustomerService("ACME").productionAccess, "granted");

    const runStart = events.find((e) => e.type === "run:start");
    const audit = auditForProposal(result.output.proposalId);
    assert.ok(runStart);
    assert.ok(
      audit.some(
        (e) =>
          e.type === "proposal.created" &&
          (e.agentRunId === runStart.runId || e.actor === "op-support"),
      ),
    );
  });

  it("info-only path does not create a proposal", async () => {
    const receptionist = createApprovalReceptionist(
      createFakeApprovalModel("info-only"),
    );
    const result = await runApprovalReceptionist(
      receptionist,
      "What are support hours?",
      { context: CONTEXT },
    );
    assert.equal(result.output.decision, "info-only");
    assert.equal(result.output.proposalId, null);
    assert.equal(result.output.requiresHumanApproval, false);
    assert.equal(result.output.accessGranted, false);
  });
});
