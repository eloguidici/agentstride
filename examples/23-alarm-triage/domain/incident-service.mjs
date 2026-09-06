/**
 * Pure domain — idempotent tickets + page proposals for Velum Grid alarms.
 */

/** @type {Map<string, object>} */
let ticketsByFingerprint = new Map();
/** @type {Map<string, Promise<object>>} */
let ticketInflight = new Map();
let ticketSeq = 5000;

/** @type {Map<string, object>} */
let pageProposals = new Map();
let pageSeq = 0;

/** @type {object[]} */
let audit = [];

export function resetAlarmStores() {
  ticketsByFingerprint = new Map();
  ticketInflight = new Map();
  ticketSeq = 5000;
  pageProposals = new Map();
  pageSeq = 0;
  audit = [];
}

function appendAudit(entry) {
  audit.push({ at: new Date().toISOString(), ...entry });
}

export function listAudit() {
  return audit.map((e) => ({ ...e }));
}

export function ticketCount() {
  return ticketsByFingerprint.size;
}

export function listTickets() {
  return [...ticketsByFingerprint.values()].map((t) => ({ ...t }));
}

/**
 * Open at most one ticket per alarm fingerprint.
 */
export async function openTicketService({
  fingerprint,
  source,
  team,
  summary,
  requestId,
  openedBy,
}) {
  const existing = ticketsByFingerprint.get(fingerprint);
  if (existing) {
    return { ...existing, replayed: true };
  }

  const pending = ticketInflight.get(fingerprint);
  if (pending) {
    const shared = await pending;
    return { ...shared, replayed: true };
  }

  const createPromise = (async () => {
    const again = ticketsByFingerprint.get(fingerprint);
    if (again) return { ...again, replayed: true };
    ticketSeq += 1;
    const ticket = {
      ticketId: `VG-TCK-${ticketSeq}`,
      fingerprint,
      source,
      team,
      summary,
      requestId,
      openedBy,
      status: "open",
      replayed: false,
    };
    ticketsByFingerprint.set(fingerprint, ticket);
    appendAudit({
      type: "ticket.opened",
      fingerprint,
      ticketId: ticket.ticketId,
      actor: openedBy,
    });
    return ticket;
  })();

  ticketInflight.set(fingerprint, createPromise);
  try {
    return await createPromise;
  } finally {
    ticketInflight.delete(fingerprint);
  }
}

export function proposePageService({
  fingerprint,
  source,
  team,
  reason,
  requestedBy,
  requestId,
  agentRunId = null,
}) {
  const existing = [...pageProposals.values()].find(
    (p) => p.fingerprint === fingerprint && p.status === "pending",
  );
  if (existing) {
    return { ...existing, replayed: true };
  }

  pageSeq += 1;
  const proposal = {
    id: `vg-page-${pageSeq}`,
    type: "page-oncall",
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
    paged: false,
  };
  pageProposals.set(proposal.id, proposal);
  appendAudit({
    type: "page.proposed",
    fingerprint,
    proposalId: proposal.id,
    actor: requestedBy,
    agentRunId,
  });
  return { ...proposal, replayed: false };
}

export function getPageProposal(id) {
  const proposal = pageProposals.get(String(id));
  if (!proposal) {
    throw Object.assign(new Error(`Page proposal not found: ${id}`), {
      name: "PageProposalNotFoundError",
    });
  }
  return { ...proposal };
}

/**
 * External approval — agent must never call this.
 */
export function approvePageProposal({ proposalId, approvedBy, roles }) {
  const allowed = Array.isArray(roles)
    ? roles.some((r) => r === "admin" || r === "sre-approver")
    : false;
  if (!allowed) {
    throw Object.assign(
      new Error(`Permission denied to approve page with roles [${(roles ?? []).join(", ")}]`),
      { name: "PermissionDeniedError" },
    );
  }

  const proposal = pageProposals.get(String(proposalId));
  if (!proposal) {
    throw Object.assign(new Error(`Page proposal not found: ${proposalId}`), {
      name: "PageProposalNotFoundError",
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
  proposal.paged = true;
  appendAudit({
    type: "page.executed",
    fingerprint: proposal.fingerprint,
    proposalId: proposal.id,
    actor: approvedBy,
  });
  return { proposal: { ...proposal }, duplicate: false };
}

export function rejectPageProposal({ proposalId, rejectedBy, roles }) {
  const allowed = Array.isArray(roles)
    ? roles.some((r) => r === "admin" || r === "sre-approver")
    : false;
  if (!allowed) {
    throw Object.assign(
      new Error(`Permission denied to reject page with roles [${(roles ?? []).join(", ")}]`),
      { name: "PermissionDeniedError" },
    );
  }
  const proposal = pageProposals.get(String(proposalId));
  if (!proposal) {
    throw Object.assign(new Error(`Page proposal not found: ${proposalId}`), {
      name: "PageProposalNotFoundError",
    });
  }
  if (proposal.status === "executed") {
    throw Object.assign(new Error(`Proposal ${proposal.id} already executed`), {
      name: "ProposalConflictError",
    });
  }
  proposal.status = "rejected";
  proposal.decidedBy = String(rejectedBy);
  proposal.paged = false;
  appendAudit({
    type: "page.rejected",
    fingerprint: proposal.fingerprint,
    proposalId: proposal.id,
    actor: rejectedBy,
  });
  return { proposal: { ...proposal } };
}
