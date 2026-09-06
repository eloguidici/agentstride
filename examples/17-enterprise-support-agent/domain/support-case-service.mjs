/**
 * Pure domain — no AgentStride imports.
 */

let caseSeq = 1000;
let failNext = false;

export function resetSupportCaseService({ failNextCreate = false } = {}) {
  caseSeq = 1000;
  failNext = failNextCreate;
}

export function createSupportCaseService({
  customerId,
  summary,
  tenantId,
  requestId,
  openedBy,
}) {
  if (failNext) {
    failNext = false;
    throw new Error("Support case backend unavailable");
  }

  caseSeq += 1;
  return {
    caseId: `CASE-${caseSeq}`,
    customerId,
    summary,
    tenantId,
    requestId,
    openedBy,
    status: "open",
  };
}
