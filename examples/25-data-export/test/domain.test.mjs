import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import {
  approveExportProposal,
  caseCount,
  openExportCaseService,
  proposeExportService,
  resetExportStores,
} from "../domain/export-service.mjs";
import {
  normalizeExportRequest,
  suggestExportAction,
} from "../domain/normalize.mjs";
import {
  sampleIdvaultRequests,
  sampleMailroomRequests,
} from "../domain/raw-samples.mjs";

describe("data-export normalize", () => {
  it("normalizes idvault and mailroom", () => {
    const ack = normalizeExportRequest(sampleIdvaultRequests()[0]);
    assert.equal(ack.hints.isAckOnly, true);
    const exp = normalizeExportRequest(sampleIdvaultRequests()[1]);
    assert.equal(exp.hints.wantsExport, true);
    const reg = normalizeExportRequest(sampleMailroomRequests()[2]);
    assert.equal(reg.hints.isRegulator, true);
  });

  it("suggests acknowledge vs proposeExport", () => {
    assert.equal(
      suggestExportAction(normalizeExportRequest(sampleIdvaultRequests()[0]))
        .recommendedAction,
      "acknowledge",
    );
    assert.equal(
      suggestExportAction(normalizeExportRequest(sampleIdvaultRequests()[1]))
        .recommendedAction,
      "proposeExport",
    );
  });
});

describe("export service", () => {
  beforeEach(() => resetExportStores());

  it("idempotent cases and external approve only", async () => {
    const a = await openExportCaseService({
      fingerprint: "idvault:iv-502",
      source: "idvault",
      team: "identity",
      subjectEmail: "blake@velum.example",
      category: "export",
      requestId: "r1",
      openedBy: "bot",
    });
    const b = await openExportCaseService({
      fingerprint: "idvault:iv-502",
      source: "idvault",
      team: "identity",
      subjectEmail: "blake@velum.example",
      category: "export",
      requestId: "r2",
      openedBy: "bot",
    });
    assert.equal(a.caseId, b.caseId);
    assert.equal(caseCount(), 1);

    const proposal = proposeExportService({
      fingerprint: "idvault:iv-502",
      source: "idvault",
      team: "identity",
      subjectEmail: "blake@velum.example",
      reason: "SAR",
      requestedBy: "bot",
      requestId: "r3",
    });
    assert.throws(
      () =>
        approveExportProposal({
          proposalId: proposal.id,
          approvedBy: "bot",
          roles: ["support"],
        }),
      (e) => e.name === "PermissionDeniedError",
    );
    const ok = approveExportProposal({
      proposalId: proposal.id,
      approvedBy: "ada",
      roles: ["privacy-officer"],
    });
    assert.equal(ok.proposal.exported, true);
  });
});
