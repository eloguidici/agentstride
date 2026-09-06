/**
 * Pure domain — in-memory audit trail (not an audit platform).
 */

/** @type {object[]} */
let entries = [];

export function resetAuditLog() {
  entries = [];
}

export function appendAudit(entry) {
  const record = {
    at: new Date().toISOString(),
    ...entry,
  };
  entries.push(record);
  return record;
}

export function listAuditEntries() {
  return entries.map((e) => ({ ...e }));
}

export function auditForProposal(proposalId) {
  return listAuditEntries().filter((e) => e.proposalId === proposalId);
}
