/**
 * Pure domain — idempotent change records + execute proposals.
 */

/** @type {Map<string, object>} */
let changesByFingerprint = new Map();
/** @type {Map<string, Promise<object>>} */
let changeInflight = new Map();
let changeSeq = 7000;

/** @type {Map<string, object>} */
let executeProposals = new Map();
let execSeq = 0;

/** @type {object[]} */
let audit = [];

export function resetChangeStores() {
  changesByFingerprint = new Map();
  changeInflight = new Map();
  changeSeq = 7000;
  executeProposals = new Map();
  execSeq = 0;
  audit = [];
}

function appendAudit(entry) {
  audit.push({ at: new Date().toISOString(), ...entry });
}

export function listAudit() {
  return audit.map((e) => ({ ...e }));
}

export function changeCount() {
  return changesByFingerprint.size;
}

export function listChanges() {
  return [...changesByFingerprint.values()].map((c) => ({ ...c }));
}

export async function openChangeRecordService({
  fingerprint,
  source,
  team,
  title,
  category,
  requestId,
  openedBy,
}) {
  const existing = changesByFingerprint.get(fingerprint);
  if (existing) return { ...existing, replayed: true };

  const pending = changeInflight.get(fingerprint);
  if (pending) {
    const shared = await pending;
    return { ...shared, replayed: true };
  }

  const createPromise = (async () => {
    const again = changesByFingerprint.get(fingerprint);
    if (again) return { ...again, replayed: true };
    changeSeq += 1;
    const record = {
      changeRecordId: `VG-CHG-${changeSeq}`,
      fingerprint,
      source,
      team,
      title,
      category,
      requestId,
      openedBy,
      status: "recorded",
      executed: false,
      replayed: false,
    };
    changesByFingerprint.set(fingerprint, record);
    appendAudit({
      type: "change.recorded",
      fingerprint,
      changeRecordId: record.changeRecordId,
      actor: openedBy,
    });
    return record;
  })();

  changeInflight.set(fingerprint, createPromise);
  try {
    return await createPromise;
  } finally {
    changeInflight.delete(fingerprint);
  }
}

export function proposeExecuteService({
  fingerprint,
  source,
  team,
  reason,
  requestedBy,
  requestId,
  agentRunId = null,
}) {
  const existing = [...executeProposals.values()].find(
    (p) => p.fingerprint === fingerprint && p.status === "pending",
  );
  if (existing) return { ...existing, replayed: true };

  execSeq += 1;
  const proposal = {
    id: `vg-exec-${execSeq}`,
    type: "execute-change",
    fingerprint,
    source,
    team,
    reason,
    requestedBy,
    requestId,
    agentRunId,
    status: "pending",
    createdAt: new Date().toISOString(),
    decidedBy: null,
    executed: false,
  };
  executeProposals.set(proposal.id, proposal);
  appendAudit({
    type: "execute.proposed",
    fingerprint,
    proposalId: proposal.id,
    actor: requestedBy,
    agentRunId,
  });
  return { ...proposal, replayed: false };
}

export function getExecuteProposal(id) {
  const proposal = executeProposals.get(String(id));
  if (!proposal) {
    throw Object.assign(new Error(`Execute proposal not found: ${id}`), {
      name: "ExecuteProposalNotFoundError",
    });
  }
  return { ...proposal };
}

/**
 * External approval — agent must never call this.
 */
export function approveExecuteProposal({ proposalId, approvedBy, roles }) {
  const allowed = Array.isArray(roles)
    ? roles.some((r) => r === "admin" || r === "change-approver")
    : false;
  if (!allowed) {
    throw Object.assign(
      new Error(
        `Permission denied to approve execute with roles [${(roles ?? []).join(", ")}]`,
      ),
      { name: "PermissionDeniedError" },
    );
  }

  const proposal = executeProposals.get(String(proposalId));
  if (!proposal) {
    throw Object.assign(new Error(`Execute proposal not found: ${proposalId}`), {
      name: "ExecuteProposalNotFoundError",
    });
  }
  if (proposal.status === "executed") {
    return { proposal: { ...proposal }, duplicate: true };
  }
  if (proposal.status === "rejected") {
    throw Object.assign(new Error(`Proposal ${proposal.id} was rejected`), {
      name: "ProposalConflictError",
    });
  }

  proposal.status = "executed";
  proposal.decidedBy = String(approvedBy);
  proposal.executed = true;

  const record = changesByFingerprint.get(proposal.fingerprint);
  if (record) {
    record.status = "executed";
    record.executed = true;
  }

  appendAudit({
    type: "execute.executed",
    fingerprint: proposal.fingerprint,
    proposalId: proposal.id,
    actor: approvedBy,
  });
  return { proposal: { ...proposal }, duplicate: false };
}

export function rejectExecuteProposal({ proposalId, rejectedBy, roles }) {
  const allowed = Array.isArray(roles)
    ? roles.some((r) => r === "admin" || r === "change-approver")
    : false;
  if (!allowed) {
    throw Object.assign(
      new Error(
        `Permission denied to reject execute with roles [${(roles ?? []).join(", ")}]`,
      ),
      { name: "PermissionDeniedError" },
    );
  }
  const proposal = executeProposals.get(String(proposalId));
  if (!proposal) {
    throw Object.assign(new Error(`Execute proposal not found: ${proposalId}`), {
      name: "ExecuteProposalNotFoundError",
    });
  }
  if (proposal.status === "executed") {
    throw Object.assign(new Error(`Proposal ${proposal.id} already executed`), {
      name: "ProposalConflictError",
    });
  }
  proposal.status = "rejected";
  proposal.decidedBy = String(rejectedBy);
  proposal.executed = false;
  appendAudit({
    type: "execute.rejected",
    fingerprint: proposal.fingerprint,
    proposalId: proposal.id,
    actor: rejectedBy,
  });
  return { proposal: { ...proposal } };
}
