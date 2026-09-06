import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import { createChangeAgent, runChangeGate } from "../agents/change-agent.mjs";
import {
  changeCount,
  resetChangeStores,
} from "../domain/change-service.mjs";
import { createFakeChangeModel } from "../fake-model.mjs";

const ctx = {
  tenantId: "velum-grid",
  userId: "change-bot",
  requestId: "agent-1",
  roles: ["sre"],
};

describe("change-gate agent behavior", () => {
  beforeEach(() => {
    resetChangeStores();
  });

  it("routine records without proposeExecute", async () => {
    const agent = createChangeAgent(createFakeChangeModel("shipyard-docs"));
    const run = await runChangeGate(agent, "Gate docs change", { context: ctx });
    assert.equal(run.output.category, "routine");
    assert.equal(run.output.action, "record");
    assert.equal(run.output.executed, false);
    assert.equal(run.output.executeProposalId, null);
    assert.equal(changeCount(), 1);
  });

  it("emergency proposes execute but keeps executed=false", async () => {
    const agent = createChangeAgent(createFakeChangeModel("shipyard-hotfix"));
    const run = await runChangeGate(agent, "Gate hotfix", { context: ctx });
    assert.equal(run.output.category, "emergency");
    assert.equal(run.output.action, "proposeExecute");
    assert.equal(run.output.requiresHumanApproval, true);
    assert.equal(run.output.executed, false);
    assert.ok(run.output.executeProposalId);
  });
});
