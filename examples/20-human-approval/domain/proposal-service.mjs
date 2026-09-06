/**
 * Pure domain — proposed sensitive actions.
 * The agent may create proposals; only external approve/reject executes or cancels.
 */

import { appendAudit } from "./audit-service.mjs";
import { grantProductionAccessService } from "./customer-service.mjs";
import { ACTIONS, assertCanPerform } from "./permissions.mjs";

export const PROPOSAL_TYPES = {
  GRANT_PRODUCTION_ACCESS: "grant-production-access",
};

export const PROPOSAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  EXECUTED: "executed",
  EXPIRED: "expired",
};

/** @type {Map<string, object>} */
let proposals = new Map();
let seq = 0;

export function resetProposalStore() {
  proposals = new Map();
  seq = 0;
}

export class ProposalNotFoundError extends Error {
  constructor(id) {
    super(`Proposal not found: ${id}`);
    this.name = "ProposalNotFoundError";
    this.proposalId = id;
  }
}

export class ProposalConflictError extends Error {
  constructor(message, proposal) {
    super(message);
    this.name = "ProposalConflictError";
    this.proposal = proposal;
  }
}

export class ProposalExpiredError extends Error {
  constructor(proposal) {
    super(`Proposal expired: ${proposal.id}`);
    this.name = "ProposalExpiredError";
    this.proposal = proposal;
  }
}

/**
 * Create a pending proposal. Does not grant access.
 */
export function createProposedAction({
  type,
  parameters,
  reason,
  requestedBy,
  tenantId,
  requestId,
  agentRunId = null,
  expiresAt = null,
  now = Date.now(),
}) {
  seq += 1;
  const id = `prop-${seq}`;
  const proposal = {
    id,
    type,
    parameters: { ...parameters },
    reason: String(reason),
    requestedBy: String(requestedBy),
    tenantId: String(tenantId),
    requestId: String(requestId),
    agentRunId: agentRunId == null ? null : String(agentRunId),
    status: PROPOSAL_STATUS.PENDING,
    createdAt: new Date(now).toISOString(),
    expiresAt: expiresAt == null ? null : new Date(expiresAt).toISOString(),
    decidedBy: null,
    decidedAt: null,
    executionResult: null,
  };
  proposals.set(id, proposal);
  appendAudit({
    type: "proposal.created",
    proposalId: id,
    actor: proposal.requestedBy,
    agentRunId: proposal.agentRunId,
    detail: { actionType: type, reason: proposal.reason },
  });
  return { ...proposal, parameters: { ...proposal.parameters } };
}

export function getProposedAction(id) {
  const proposal = proposals.get(String(id));
  if (!proposal) {
    throw new ProposalNotFoundError(id);
  }
  return { ...proposal, parameters: { ...proposal.parameters } };
}

export function listProposedActions() {
  return [...proposals.values()].map((p) => ({
    ...p,
    parameters: { ...p.parameters },
  }));
}

function markExpiredIfNeeded(proposal, now) {
  if (
    proposal.status === PROPOSAL_STATUS.PENDING &&
    proposal.expiresAt &&
    now > Date.parse(proposal.expiresAt)
  ) {
    proposal.status = PROPOSAL_STATUS.EXPIRED;
    appendAudit({
      type: "proposal.expired",
      proposalId: proposal.id,
      actor: "system",
      agentRunId: proposal.agentRunId,
    });
  }
}

/**
 * External approval. Agent must never call this.
 * Executes the domain side effect exactly once.
 */
export function approveProposedAction({
  proposalId,
  approvedBy,
  roles,
  now = Date.now(),
}) {
  assertCanPerform(roles, ACTIONS.APPROVE_PRODUCTION_ACCESS);

  const proposal = proposals.get(String(proposalId));
  if (!proposal) {
    throw new ProposalNotFoundError(proposalId);
  }

  markExpiredIfNeeded(proposal, now);

  if (proposal.status === PROPOSAL_STATUS.EXECUTED) {
    // Idempotent read of prior execution — do not re-run side effect.
    return {
      proposal: getProposedAction(proposal.id),
      execution: proposal.executionResult,
      duplicate: true,
    };
  }

  if (proposal.status === PROPOSAL_STATUS.REJECTED) {
    throw new ProposalConflictError(
      `Proposal ${proposal.id} was rejected and cannot execute`,
      getProposedAction(proposal.id),
    );
  }

  if (proposal.status === PROPOSAL_STATUS.EXPIRED) {
    throw new ProposalExpiredError(getProposedAction(proposal.id));
  }

  if (proposal.status !== PROPOSAL_STATUS.PENDING) {
    throw new ProposalConflictError(
      `Proposal ${proposal.id} is ${proposal.status}`,
      getProposedAction(proposal.id),
    );
  }

  proposal.status = PROPOSAL_STATUS.APPROVED;
  proposal.decidedBy = String(approvedBy);
  proposal.decidedAt = new Date(now).toISOString();
  appendAudit({
    type: "proposal.approved",
    proposalId: proposal.id,
    actor: proposal.decidedBy,
    agentRunId: proposal.agentRunId,
  });

  if (proposal.type !== PROPOSAL_TYPES.GRANT_PRODUCTION_ACCESS) {
    throw new ProposalConflictError(
      `Unsupported proposal type: ${proposal.type}`,
      getProposedAction(proposal.id),
    );
  }

  const execution = grantProductionAccessService({
    customerId: String(proposal.parameters.customerId),
    grantedBy: proposal.decidedBy,
    proposalId: proposal.id,
  });

  proposal.executionResult = execution;
  proposal.status = PROPOSAL_STATUS.EXECUTED;
  appendAudit({
    type: "proposal.executed",
    proposalId: proposal.id,
    actor: proposal.decidedBy,
    agentRunId: proposal.agentRunId,
    detail: execution,
  });

  return {
    proposal: getProposedAction(proposal.id),
    execution,
    duplicate: false,
  };
}

/**
 * External rejection. Never executes the side effect.
 */
export function rejectProposedAction({
  proposalId,
  rejectedBy,
  roles,
  reason = "rejected",
  now = Date.now(),
}) {
  assertCanPerform(roles, ACTIONS.REJECT_PRODUCTION_ACCESS);

  const proposal = proposals.get(String(proposalId));
  if (!proposal) {
    throw new ProposalNotFoundError(proposalId);
  }

  markExpiredIfNeeded(proposal, now);

  if (proposal.status === PROPOSAL_STATUS.EXECUTED) {
    throw new ProposalConflictError(
      `Proposal ${proposal.id} already executed`,
      getProposedAction(proposal.id),
    );
  }

  if (proposal.status === PROPOSAL_STATUS.REJECTED) {
    return { proposal: getProposedAction(proposal.id), duplicate: true };
  }

  if (proposal.status === PROPOSAL_STATUS.EXPIRED) {
    throw new ProposalExpiredError(getProposedAction(proposal.id));
  }

  if (proposal.status !== PROPOSAL_STATUS.PENDING) {
    throw new ProposalConflictError(
      `Proposal ${proposal.id} is ${proposal.status}`,
      getProposedAction(proposal.id),
    );
  }

  proposal.status = PROPOSAL_STATUS.REJECTED;
  proposal.decidedBy = String(rejectedBy);
  proposal.decidedAt = new Date(now).toISOString();
  appendAudit({
    type: "proposal.rejected",
    proposalId: proposal.id,
    actor: proposal.decidedBy,
    agentRunId: proposal.agentRunId,
    detail: { reason: String(reason) },
  });

  return { proposal: getProposedAction(proposal.id), duplicate: false };
}
