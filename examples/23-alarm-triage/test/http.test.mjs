import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import {
  getPageProposal,
  resetAlarmStores,
  ticketCount,
} from "../domain/incident-service.mjs";
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

describe("Velum Grid alarm triage HTTP", () => {
  beforeEach(() => {
    resetAlarmStores();
  });

  it("POST /alarms/triage then approve pages; duplicate approve is idempotent", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/alarms/triage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "triage-bot",
          "x-roles": "sre",
          "x-tenant-id": "velum-grid",
          "x-request-id": "http-vg-1",
        },
        body: JSON.stringify({
          input: "Triage pulsebeat crash",
          scenario: "pulsebeat-crash",
        }),
      });
      const runBody = await runRes.json();
      assert.equal(runRes.status, 200);
      assert.equal(runBody.output.requiresHumanApproval, true);
      assert.equal(runBody.output.paged, false);
      assert.equal(ticketCount(), 1);

      const proposalId = runBody.output.pageProposalId;
      const approveRes = await fetch(
        `http://127.0.0.1:${port}/pages/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "sre-lead-mira",
            "x-roles": "sre-approver",
          },
          body: "{}",
        },
      );
      const approveBody = await approveRes.json();
      assert.equal(approveRes.status, 200);
      assert.equal(approveBody.duplicate, false);
      assert.equal(approveBody.proposal.paged, true);

      const again = await fetch(
        `http://127.0.0.1:${port}/pages/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "sre-lead-mira",
            "x-roles": "sre-approver",
          },
          body: "{}",
        },
      );
      const againBody = await again.json();
      assert.equal(againBody.duplicate, true);
    });
  });

  it("SRE cannot approve; reject leaves paged false", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/alarms/triage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "triage-bot",
          "x-roles": "sre",
        },
        body: JSON.stringify({
          input: "Triage wirewatch BGP",
          scenario: "wirewatch-bgp",
        }),
      });
      const runBody = await runRes.json();
      const proposalId = runBody.output.pageProposalId;

      const denied = await fetch(
        `http://127.0.0.1:${port}/pages/${proposalId}/approve`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-user-id": "triage-bot",
            "x-roles": "sre",
          },
          body: "{}",
        },
      );
      assert.equal(denied.status, 403);
      assert.equal(getPageProposal(proposalId).paged, false);

      const rejected = await fetch(
        `http://127.0.0.1:${port}/pages/${proposalId}/reject`,
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
      assert.equal(getPageProposal(proposalId).status, "rejected");
      assert.equal(getPageProposal(proposalId).paged, false);
    });
  });

  it("ledgerflare settlement failure proposes page without paging", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/alarms/triage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-tenant-id": "velum-grid",
        },
        body: JSON.stringify({
          input: "Triage ledgerflare settlement",
          scenario: "ledgerflare-fail",
        }),
      });
      const runBody = await runRes.json();
      assert.equal(runRes.status, 200);
      assert.equal(runBody.output.source, "ledgerflare");
      assert.equal(runBody.output.team, "payments");
      assert.equal(runBody.output.category, "incident");
      assert.equal(runBody.output.paged, false);
      assert.ok(runBody.output.pageProposalId);
    });
  });
});
