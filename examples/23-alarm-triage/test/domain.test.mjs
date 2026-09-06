import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  normalizeAlarm,
  suggestCategory,
} from "../domain/normalize.mjs";
import {
  sampleLedgerflareAlarms,
  samplePulsebeatAlarms,
  sampleWirewatchAlarms,
} from "../domain/raw-samples.mjs";
import {
  approvePageProposal,
  openTicketService,
  proposePageService,
  resetAlarmStores,
  ticketCount,
} from "../domain/incident-service.mjs";

describe("Velum Grid alarm normalize", () => {
  it("normalizes three source formats with hints", () => {
    const pb = normalizeAlarm(samplePulsebeatAlarms()[0]);
    assert.equal(pb.source, "pulsebeat");
    assert.equal(pb.hints.isPing, true);

    const ww = normalizeAlarm(sampleWirewatchAlarms()[2]);
    assert.equal(ww.source, "wirewatch");
    assert.equal(ww.hints.isError, true);

    const lf = normalizeAlarm(sampleLedgerflareAlarms()[2]);
    assert.equal(lf.source, "ledgerflare");
    assert.equal(lf.team, "payments");
    assert.equal(lf.hints.isError, true);
  });

  it("suggests drop/ticket/page from domain policy", () => {
    assert.equal(
      suggestCategory(normalizeAlarm(samplePulsebeatAlarms()[0])).recommendedAction,
      "drop",
    );
    assert.equal(
      suggestCategory(normalizeAlarm(samplePulsebeatAlarms()[1])).recommendedAction,
      "ticket",
    );
    assert.equal(
      suggestCategory(normalizeAlarm(samplePulsebeatAlarms()[2])).recommendedAction,
      "page",
    );
  });
});

describe("idempotent tickets and page proposals", () => {
  beforeEach(() => resetAlarmStores());

  it("duplicate fingerprint opens one ticket", async () => {
    const n = normalizeAlarm(samplePulsebeatAlarms()[1]);
    const a = await openTicketService({
      fingerprint: n.fingerprint,
      source: n.source,
      team: n.team,
      summary: n.message,
      requestId: "r1",
      openedBy: "bot",
    });
    const b = await openTicketService({
      fingerprint: n.fingerprint,
      source: n.source,
      team: n.team,
      summary: n.message,
      requestId: "r1",
      openedBy: "bot",
    });
    assert.equal(a.ticketId, b.ticketId);
    assert.equal(b.replayed, true);
    assert.equal(ticketCount(), 1);
  });

  it("page requires external approval and does not auto-page", () => {
    const n = normalizeAlarm(samplePulsebeatAlarms()[2]);
    const proposal = proposePageService({
      fingerprint: n.fingerprint,
      source: n.source,
      team: n.team,
      reason: "crash",
      requestedBy: "bot",
      requestId: "r2",
    });
    assert.equal(proposal.status, "pending");
    assert.equal(proposal.paged, false);

    assert.throws(() =>
      approvePageProposal({
        proposalId: proposal.id,
        approvedBy: "bot",
        roles: ["sre"],
      }),
    );

    const out = approvePageProposal({
      proposalId: proposal.id,
      approvedBy: "mira",
      roles: ["sre-approver"],
    });
    assert.equal(out.proposal.paged, true);
    assert.equal(out.duplicate, false);
  });
});
