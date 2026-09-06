import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import { resetAuditLog } from "../domain/audit-service.mjs";
import {
  findCustomerService,
  resetCustomerStore,
} from "../domain/customer-service.mjs";
import { resetProposalStore } from "../domain/proposal-service.mjs";
import { createFakeApprovalModel } from "../fake-model.mjs";
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

describe("human approval HTTP", () => {
  beforeEach(() => {
    resetCustomerStore();
    resetProposalStore();
    resetAuditLog();
  });

  it("POST approve executes and duplicate approve does not re-grant", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/support/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "op-1",
          "x-roles": "support",
          "x-tenant-id": "acme",
          "x-request-id": "http-1",
        },
        body: JSON.stringify({ input: "ACME needs production access" }),
      });
      const runBody = await runRes.json();
      assert.equal(runBody.output.requiresHumanApproval, true);
      assert.equal(findCustomerService("ACME").productionAccess, "restricted");

      const proposalId = runBody.output.proposalId;
      const approveRes = await fetch(
        `http://127.0.0.1:${port}/actions/${proposalId}/approve`,
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
      const approveBody = await approveRes.json();
      assert.equal(approveRes.status, 200);
      assert.equal(approveBody.duplicate, false);
      assert.equal(findCustomerService("ACME").productionAccess, "granted");

      const again = await fetch(
        `http://127.0.0.1:${port}/actions/${proposalId}/approve`,
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
      const againBody = await again.json();
      assert.equal(againBody.duplicate, true);
    });
  });

  it("POST reject never grants; support cannot approve via HTTP", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/support/run`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "op-1",
          "x-roles": "support",
        },
        body: JSON.stringify({ input: "ACME needs production access" }),
      });
      const runBody = await runRes.json();
      const proposalId = runBody.output.proposalId;

      const denied = await fetch(
        `http://127.0.0.1:${port}/actions/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "op-1",
            "x-roles": "support",
          },
          body: "{}",
        },
      );
      assert.equal(denied.status, 403);
      assert.equal(findCustomerService("ACME").productionAccess, "restricted");

      const rejected = await fetch(
        `http://127.0.0.1:${port}/actions/${proposalId}/reject`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "admin-1",
            "x-roles": "admin",
          },
          body: JSON.stringify({ reason: "no" }),
        },
      );
      assert.equal(rejected.status, 200);
      assert.equal(findCustomerService("ACME").productionAccess, "restricted");
    });
  });
});
