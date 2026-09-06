import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  changeCount,
  getExecuteProposal,
  resetChangeStores,
} from "../domain/change-service.mjs";
import { server as appServer } from "../http.mjs";

async function withServer(fn) {
  await new Promise((resolve) => appServer.listen(0, "127.0.0.1", resolve));
  const { port } = appServer.address();
  try {
    await fn(port);
  } finally {
    await new Promise((resolve, reject) =>
      appServer.close((err) => (err ? reject(err) : resolve())),
    );
  }
}

describe("Velum Grid change-gate HTTP", () => {
  beforeEach(() => {
    resetChangeStores();
  });

  it("POST /changes/gate then approve executes; duplicate is idempotent", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/changes/gate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "change-bot",
          "x-roles": "sre",
          "x-tenant-id": "velum-grid",
        },
        body: JSON.stringify({
          input: "Gate hotfix",
          scenario: "shipyard-hotfix",
        }),
      });
      const runBody = await runRes.json();
      assert.equal(runRes.status, 200);
      assert.equal(runBody.output.executed, false);
      assert.equal(changeCount(), 1);

      const proposalId = runBody.output.executeProposalId;
      const approveRes = await fetch(
        `http://127.0.0.1:${port}/executions/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "change-lead-nova",
            "x-roles": "change-approver",
          },
          body: "{}",
        },
      );
      const approveBody = await approveRes.json();
      assert.equal(approveRes.status, 200);
      assert.equal(approveBody.proposal.executed, true);

      const again = await fetch(
        `http://127.0.0.1:${port}/executions/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "change-lead-nova",
            "x-roles": "change-approver",
          },
          body: "{}",
        },
      );
      assert.equal((await again.json()).duplicate, true);
    });
  });

  it("SRE cannot approve; reject leaves executed false", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/changes/gate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-roles": "sre",
        },
        body: JSON.stringify({
          input: "Gate canary",
          scenario: "shipyard-canary",
        }),
      });
      const proposalId = (await runRes.json()).output.executeProposalId;

      const denied = await fetch(
        `http://127.0.0.1:${port}/executions/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-roles": "sre",
          },
          body: "{}",
        },
      );
      assert.equal(denied.status, 403);

      const rejected = await fetch(
        `http://127.0.0.1:${port}/executions/${proposalId}/reject`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "admin-1",
            "x-roles": "admin",
          },
          body: "{}",
        },
      );
      assert.equal(rejected.status, 200);
      assert.equal(getExecuteProposal(proposalId).executed, false);
    });
  });
});
