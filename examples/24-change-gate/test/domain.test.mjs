import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  normalizeChange,
  suggestChangeAction,
} from "../domain/normalize.mjs";
import {
  sampleLedgeropsChanges,
  sampleShipyardChanges,
  sampleWiredeskChanges,
} from "../domain/raw-samples.mjs";
import {
  approveExecuteProposal,
  changeCount,
  openChangeRecordService,
  proposeExecuteService,
  rejectExecuteProposal,
  resetChangeStores,
} from "../domain/change-service.mjs";

describe("Velum Grid change normalize", () => {
  it("normalizes three source formats", () => {
    const sy = normalizeChange(sampleShipyardChanges()[0]);
    assert.equal(sy.source, "shipyard");
    assert.equal(sy.hints.isRoutine, true);

    const wd = normalizeChange(sampleWiredeskChanges()[1]);
    assert.equal(wd.source, "wiredesk");
    assert.equal(wd.hints.isElevated, true);

    const lo = normalizeChange(sampleLedgeropsChanges()[2]);
    assert.equal(lo.source, "ledgerops");
    assert.equal(lo.team, "payments");
    assert.equal(lo.hints.isEmergency, true);
  });

  it("suggests record vs proposeExecute from domain policy", () => {
    assert.equal(
      suggestChangeAction(normalizeChange(sampleShipyardChanges()[0]))
        .recommendedAction,
      "record",
    );
    assert.equal(
      suggestChangeAction(normalizeChange(sampleShipyardChanges()[1]))
        .recommendedAction,
      "proposeExecute",
    );
    assert.equal(
      suggestChangeAction(normalizeChange(sampleShipyardChanges()[2])).category,
      "emergency",
    );
  });
});

describe("idempotent change records and execute proposals", () => {
  beforeEach(() => {
    resetChangeStores();
  });

  it("duplicate fingerprint records one change", async () => {
    const a = await openChangeRecordService({
      fingerprint: "shipyard:sy-401",
      source: "shipyard",
      team: "platform",
      title: "bump docs theme",
      category: "routine",
      requestId: "r1",
      openedBy: "bot",
    });
    const b = await openChangeRecordService({
      fingerprint: "shipyard:sy-401",
      source: "shipyard",
      team: "platform",
      title: "bump docs theme",
      category: "routine",
      requestId: "r2",
      openedBy: "bot",
    });
    assert.equal(a.changeRecordId, b.changeRecordId);
    assert.equal(b.replayed, true);
    assert.equal(changeCount(), 1);
  });

  it("execute requires external approval and does not auto-run", () => {
    const proposal = proposeExecuteService({
      fingerprint: "shipyard:sy-403",
      source: "shipyard",
      team: "platform",
      reason: "hotfix",
      requestedBy: "bot",
      requestId: "r3",
    });
    assert.equal(proposal.executed, false);
    assert.equal(proposal.status, "pending");

    assert.throws(
      () =>
        approveExecuteProposal({
          proposalId: proposal.id,
          approvedBy: "bot",
          roles: ["sre"],
        }),
      (err) => err.name === "PermissionDeniedError",
    );

    const rejected = rejectExecuteProposal({
      proposalId: proposal.id,
      rejectedBy: "lead",
      roles: ["change-approver"],
    });
    assert.equal(rejected.proposal.status, "rejected");
    assert.equal(rejected.proposal.executed, false);
  });
});
