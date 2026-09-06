/** @type {Map<string, object>} */
let casesByFingerprint = new Map();
/** @type {Map<string, Promise<object>>} */
let caseInflight = new Map();
let caseSeq = 8000;

/** @type {Map<string, object>} */
let exportProposals = new Map();
let exportSeq = 0;

/** @type {object[]} */
let audit = [];

/** @type {Map<string, object>} */
const inventory = new Map([
  [
    "alex@velum.example",
    { email: "alex@velum.example", systems: ["idvault"], records: 2 },
  ],
  [
    "blake@velum.example",
    {
      email: "blake@velum.example",
      systems: ["idvault", "ledgerflare"],
      records: 11,
    },
  ],
  [
    "casey@velum.example",
    {
      email: "casey@velum.example",
      systems: ["idvault", "ledgerflare", "mailroom"],
      records: 17,
    },
  ],
]);

export function resetExportStores() {
  casesByFingerprint = new Map();
  caseInflight = new Map();
  caseSeq = 8000;
  exportProposals = new Map();
  exportSeq = 0;
  audit = [];
}

function appendAudit(entry) {
  audit.push({ at: new Date().toISOString(), ...entry });
}

export function listAudit() {
  return audit.map((e) => ({ ...e }));
}

export function caseCount() {
  return casesByFingerprint.size;
}

export function findInventory(email) {
  return inventory.get(String(email).toLowerCase()) ?? {
    email: String(email).toLowerCase(),
    systems: [],
    records: 0,
  };
}

export async function openExportCaseService({
  fingerprint,
  source,
  team,
  subjectEmail,
  category,
  requestId,
  openedBy,
}) {
  const existing = casesByFingerprint.get(fingerprint);
  if (existing) return { ...existing, replayed: true };

  const pending = caseInflight.get(fingerprint);
  if (pending) {
    const shared = await pending;
    return { ...shared, replayed: true };
  }

  const createPromise = (async () => {
    const again = casesByFingerprint.get(fingerprint);
    if (again) return { ...again, replayed: true };
    caseSeq += 1;
    const record = {
      caseId: `VG-SAR-${caseSeq}`,
      fingerprint,
      source,
      team,
      subjectEmail,
      category,
      requestId,
      openedBy,
      status: "open",
      exported: false,
      replayed: false,
    };
    casesByFingerprint.set(fingerprint, record);
    appendAudit({
      type: "sar.opened",
      fingerprint,
      caseId: record.caseId,
      actor: openedBy,
    });
    return record;
  })();

  caseInflight.set(fingerprint, createPromise);
  try {
    return await createPromise;
  } finally {
    caseInflight.delete(fingerprint);
  }
}

export function proposeExportService({
  fingerprint,
  source,
  team,
  subjectEmail,
  reason,
  requestedBy,
  requestId,
  agentRunId = null,
}) {
  const existing = [...exportProposals.values()].find(
    (p) => p.fingerprint === fingerprint && p.status === "pending",
  );
  if (existing) return { ...existing, replayed: true };

  exportSeq += 1;
  const inventoryHit = findInventory(subjectEmail);
  const proposal = {
    id: `vg-exp-${exportSeq}`,
    type: "export-package",
    fingerprint,
    source,
    team,
    subjectEmail,
    reason,
    inventory: inventoryHit,
    requestedBy,
    requestId,
    agentRunId,
    status: "pending",
    createdAt: new Date().toISOString(),
    decidedBy: null,
    exported: false,
  };
  exportProposals.set(proposal.id, proposal);
  appendAudit({
    type: "export.proposed",
    fingerprint,
    proposalId: proposal.id,
    actor: requestedBy,
    agentRunId,
  });
  return { ...proposal, replayed: false };
}

export function getExportProposal(id) {
  const proposal = exportProposals.get(String(id));
  if (!proposal) {
    throw Object.assign(new Error(`Export proposal not found: ${id}`), {
      name: "ExportProposalNotFoundError",
    });
  }
  return { ...proposal };
}

export function approveExportProposal({ proposalId, approvedBy, roles }) {
  const allowed = Array.isArray(roles)
    ? roles.some((r) => r === "admin" || r === "privacy-officer")
    : false;
  if (!allowed) {
    throw Object.assign(
      new Error(
        `Permission denied to approve export with roles [${(roles ?? []).join(", ")}]`,
      ),
      { name: "PermissionDeniedError" },
    );
  }
  const proposal = exportProposals.get(String(proposalId));
  if (!proposal) {
    throw Object.assign(new Error(`Export proposal not found: ${proposalId}`), {
      name: "ExportProposalNotFoundError",
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
  proposal.exported = true;
  const record = casesByFingerprint.get(proposal.fingerprint);
  if (record) {
    record.status = "exported";
    record.exported = true;
  }
  appendAudit({
    type: "export.executed",
    fingerprint: proposal.fingerprint,
    proposalId: proposal.id,
    actor: approvedBy,
  });
  return { proposal: { ...proposal }, duplicate: false };
}

export function rejectExportProposal({ proposalId, rejectedBy, roles }) {
  const allowed = Array.isArray(roles)
    ? roles.some((r) => r === "admin" || r === "privacy-officer")
    : false;
  if (!allowed) {
    throw Object.assign(
      new Error(
        `Permission denied to reject export with roles [${(roles ?? []).join(", ")}]`,
      ),
      { name: "PermissionDeniedError" },
    );
  }
  const proposal = exportProposals.get(String(proposalId));
  if (!proposal) {
    throw Object.assign(new Error(`Export proposal not found: ${proposalId}`), {
      name: "ExportProposalNotFoundError",
    });
  }
  if (proposal.status === "executed") {
    throw Object.assign(new Error(`Proposal ${proposal.id} already executed`), {
      name: "ProposalConflictError",
    });
  }
  proposal.status = "rejected";
  proposal.decidedBy = String(rejectedBy);
  proposal.exported = false;
  appendAudit({
    type: "export.rejected",
    fingerprint: proposal.fingerprint,
    proposalId: proposal.id,
    actor: rejectedBy,
  });
  return { proposal: { ...proposal } };
}
