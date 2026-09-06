import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import { auditForProposal, resetAuditLog } from "../domain/audit-service.mjs";
import {
  findCustomerService,
  resetCustomerStore,
} from "../domain/customer-service.mjs";
import {
  PROPOSAL_STATUS,
  PROPOSAL_TYPES,
  ProposalConflictError,
  ProposalExpiredError,
  ProposalNotFoundError,
  approveProposedAction,
  createProposedAction,
  getProposedAction,
  rejectProposedAction,
  resetProposalStore,
} from "../domain/proposal-service.mjs";
import { PermissionDeniedError } from "../domain/permissions.mjs";

function seedProposal(overrides = {}) {
  return createProposedAction({
    type: PROPOSAL_TYPES.GRANT_PRODUCTION_ACCESS,
    parameters: { customerId: "ACME" },
    reason: "needs prod",
    requestedBy: "op-1",
    tenantId: "acme",
    requestId: "req-1",
    agentRunId: "run_parent_1",
    ...overrides,
  });
}

describe("human approval domain", () => {
  beforeEach(() => {
    resetCustomerStore();
    resetProposalStore();
    resetAuditLog();
  });

  it("sensitive proposal does not grant access", () => {
    const proposal = seedProposal();
    assert.equal(proposal.status, PROPOSAL_STATUS.PENDING);
    assert.equal(findCustomerService("ACME").productionAccess, "restricted");
  });

  it("authorized approver executes grant exactly once", () => {
    const proposal = seedProposal();
    const first = approveProposedAction({
      proposalId: proposal.id,
      approvedBy: "admin-1",
      roles: ["admin"],
    });
    assert.equal(first.duplicate, false);
    assert.equal(first.proposal.status, PROPOSAL_STATUS.EXECUTED);
    assert.equal(findCustomerService("ACME").productionAccess, "granted");

    const second = approveProposedAction({
      proposalId: proposal.id,
      approvedBy: "admin-2",
      roles: ["admin"],
    });
    assert.equal(second.duplicate, true);
    assert.equal(second.execution.proposalId, proposal.id);
    assert.equal(findCustomerService("ACME").productionAccess, "granted");
  });

  it("unauthorized approver is rejected", () => {
    const proposal = seedProposal();
    assert.throws(
      () =>
        approveProposedAction({
          proposalId: proposal.id,
          approvedBy: "op-1",
          roles: ["support"],
        }),
      (error) => error instanceof PermissionDeniedError,
    );
    assert.equal(findCustomerService("ACME").productionAccess, "restricted");
    assert.equal(getProposedAction(proposal.id).status, PROPOSAL_STATUS.PENDING);
  });

  it("rejection never executes side effect", () => {
    const proposal = seedProposal();
    const out = rejectProposedAction({
      proposalId: proposal.id,
      rejectedBy: "sec-1",
      roles: ["security-approver"],
      reason: "insufficient justification",
    });
    assert.equal(out.proposal.status, PROPOSAL_STATUS.REJECTED);
    assert.equal(findCustomerService("ACME").productionAccess, "restricted");
  });

  it("rejected proposal cannot later execute", () => {
    const proposal = seedProposal();
    rejectProposedAction({
      proposalId: proposal.id,
      rejectedBy: "admin-1",
      roles: ["admin"],
    });
    assert.throws(
      () =>
        approveProposedAction({
          proposalId: proposal.id,
          approvedBy: "admin-1",
          roles: ["admin"],
        }),
      (error) => error instanceof ProposalConflictError,
    );
    assert.equal(findCustomerService("ACME").productionAccess, "restricted");
  });

  it("expired proposal cannot execute", () => {
    const proposal = seedProposal({
      expiresAt: Date.now() - 1000,
    });
    assert.throws(
      () =>
        approveProposedAction({
          proposalId: proposal.id,
          approvedBy: "admin-1",
          roles: ["admin"],
          now: Date.now(),
        }),
      (error) => error instanceof ProposalExpiredError,
    );
    assert.equal(findCustomerService("ACME").productionAccess, "restricted");
    assert.equal(getProposedAction(proposal.id).status, PROPOSAL_STATUS.EXPIRED);
  });

  it("unknown proposal fails safely", () => {
    assert.throws(
      () =>
        approveProposedAction({
          proposalId: "prop-missing",
          approvedBy: "admin-1",
          roles: ["admin"],
        }),
      (error) => error instanceof ProposalNotFoundError,
    );
  });

  it("audit trail contains requester approver and run correlation", () => {
    const proposal = seedProposal({ agentRunId: "run_abc" });
    approveProposedAction({
      proposalId: proposal.id,
      approvedBy: "admin-jane",
      roles: ["admin"],
    });
    const audit = auditForProposal(proposal.id);
    const types = audit.map((e) => e.type);
    assert.ok(types.includes("proposal.created"));
    assert.ok(types.includes("proposal.approved"));
    assert.ok(types.includes("proposal.executed"));
    assert.equal(audit[0].actor, "op-1");
    assert.equal(audit.find((e) => e.type === "proposal.approved").actor, "admin-jane");
    assert.ok(audit.every((e) => e.agentRunId === "run_abc" || e.type === "proposal.executed"));
    assert.equal(
      audit.find((e) => e.type === "proposal.created").agentRunId,
      "run_abc",
    );
  });
});
