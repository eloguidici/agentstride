import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";

import { createExportAgent, runExportGate } from "../agents/export-agent.mjs";
import { resetExportStores } from "../domain/export-service.mjs";
import { createFakeExportModel } from "../fake-model.mjs";
import { server as appServer } from "../http.mjs";

describe("data-export agent", () => {
  beforeEach(() => resetExportStores());

  it("ack does not propose export", async () => {
    const agent = createExportAgent(createFakeExportModel("idvault-ack"));
    const run = await runExportGate(agent, "ack", {
      context: { tenantId: "velum-grid", userId: "bot", requestId: "a1" },
    });
    assert.equal(run.output.action, "acknowledge");
    assert.equal(run.output.exported, false);
    assert.equal(run.output.exportProposalId, null);
  });

  it("export proposes without exporting", async () => {
    const agent = createExportAgent(createFakeExportModel("idvault-export"));
    const run = await runExportGate(agent, "export", {
      context: { tenantId: "velum-grid", userId: "bot", requestId: "a2" },
    });
    assert.equal(run.output.action, "proposeExport");
    assert.equal(run.output.exported, false);
    assert.ok(run.output.exportProposalId);
  });
});

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

describe("data-export HTTP", () => {
  beforeEach(() => resetExportStores());

  it("approve path requires privacy-officer", async () => {
    await withServer(async (port) => {
      const runRes = await fetch(`http://127.0.0.1:${port}/exports/gate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario: "idvault-export", input: "export" }),
      });
      const body = await runRes.json();
      const id = body.output.exportProposalId;

      const denied = await fetch(
        `http://127.0.0.1:${port}/exports/${id}/approve`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-roles": "support" },
          body: "{}",
        },
      );
      assert.equal(denied.status, 403);

      const ok = await fetch(`http://127.0.0.1:${port}/exports/${id}/approve`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-roles": "privacy-officer",
          "x-user-id": "ada",
        },
        body: "{}",
      });
      assert.equal(ok.status, 200);
      assert.equal((await ok.json()).proposal.exported, true);
    });
  });
});
