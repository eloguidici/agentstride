import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  createTriageAgent,
  createTriageTools,
  runTriage,
} from "../agents/triage-agent.mjs";
import {
  resetAlarmStores,
  ticketCount,
} from "../domain/incident-service.mjs";
import { createFakeTriageModel } from "../fake-model.mjs";

const CTX = {
  tenantId: "velum-grid",
  userId: "triage-bot",
  requestId: "req-triage-1",
  roles: ["sre"],
};

describe("triage agent behavior", () => {
  beforeEach(() => resetAlarmStores());

  it("drops ping/noise without ticket or page", async () => {
    const agent = createTriageAgent(createFakeTriageModel("pulsebeat-ping"));
    const result = await runTriage(agent, "triage ping", { context: CTX });
    assert.equal(result.output.category, "noise");
    assert.equal(result.output.action, "drop");
    assert.equal(result.output.ticketId, null);
    assert.equal(result.output.pageProposalId, null);
    assert.equal(result.output.paged, false);
    assert.equal(ticketCount(), 0);
  });

  it("opens ticket for warning without page proposal", async () => {
    const agent = createTriageAgent(createFakeTriageModel("pulsebeat-warn"));
    const result = await runTriage(agent, "triage warn", { context: CTX });
    assert.equal(result.output.category, "warning");
    assert.equal(result.output.action, "ticket");
    assert.ok(result.output.ticketId);
    assert.equal(result.output.pageProposalId, null);
    assert.equal(result.output.requiresHumanApproval, false);
    assert.equal(ticketCount(), 1);
  });

  it("incident proposes page but does not page; no approve tool", async () => {
    const agent = createTriageAgent(createFakeTriageModel("pulsebeat-crash"));
    const result = await runTriage(agent, "triage crash", { context: CTX });
    assert.equal(result.output.category, "incident");
    assert.equal(result.output.action, "page");
    assert.equal(result.output.requiresHumanApproval, true);
    assert.equal(result.output.paged, false);
    assert.ok(result.output.pageProposalId);
    assert.ok(result.output.ticketId);

    const tools = createTriageTools();
    assert.equal(tools.approvePage, undefined);
    assert.deepEqual(Object.keys(tools).sort(), [
      "normalizeAndAssess",
      "openTicket",
      "proposePage",
    ]);
  });

  it("wirewatch critical follows incident path", async () => {
    const agent = createTriageAgent(createFakeTriageModel("wirewatch-bgp"));
    const result = await runTriage(agent, "triage bgp", { context: CTX });
    assert.equal(result.output.source, "wirewatch");
    assert.equal(result.output.team, "netops");
    assert.equal(result.output.category, "incident");
    assert.equal(result.output.paged, false);
  });

  it("duplicate triage of same warning does not duplicate tickets", async () => {
    const a1 = createTriageAgent(createFakeTriageModel("pulsebeat-warn"));
    const r1 = await runTriage(a1, "warn 1", {
      context: { ...CTX, requestId: "req-a" },
    });
    const a2 = createTriageAgent(createFakeTriageModel("pulsebeat-warn"));
    const r2 = await runTriage(a2, "warn 2", {
      context: { ...CTX, requestId: "req-b" },
    });
    assert.equal(r1.output.ticketId, r2.output.ticketId);
    assert.equal(ticketCount(), 1);
  });
});
