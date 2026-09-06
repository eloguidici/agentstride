import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";

import { createCaseAgent } from "../agents/case-agent.mjs";
import {
  caseCount,
  createSupportCaseService,
  listCases,
  resetSupportCaseStore,
} from "../domain/support-case-service.mjs";

describe("idempotent support-case domain", () => {
  beforeEach(() => {
    resetSupportCaseStore();
  });

  it("duplicate key returns same business result and one side effect", async () => {
    const a = await createSupportCaseService({
      customerId: "ACME",
      summary: "outage",
      tenantId: "acme",
      requestId: "req-1",
      openedBy: "op-1",
    });
    const b = await createSupportCaseService({
      customerId: "ACME",
      summary: "outage again",
      tenantId: "acme",
      requestId: "req-1",
      openedBy: "op-1",
    });
    assert.equal(a.caseId, b.caseId);
    assert.equal(a.replayed, false);
    assert.equal(b.replayed, true);
    assert.equal(caseCount(), 1);
  });

  it("different requestId creates a new case", async () => {
    await createSupportCaseService({
      customerId: "ACME",
      summary: "a",
      tenantId: "acme",
      requestId: "req-a",
      openedBy: "op-1",
    });
    await createSupportCaseService({
      customerId: "ACME",
      summary: "b",
      tenantId: "acme",
      requestId: "req-b",
      openedBy: "op-1",
    });
    assert.equal(caseCount(), 2);
  });

  it("explicit idempotencyKey overrides request pairing", async () => {
    const a = await createSupportCaseService({
      customerId: "ACME",
      summary: "x",
      tenantId: "acme",
      requestId: "req-1",
      openedBy: "op-1",
      idempotencyKey: "fixed-key",
    });
    const b = await createSupportCaseService({
      customerId: "ACME",
      summary: "y",
      tenantId: "acme",
      requestId: "req-OTHER",
      openedBy: "op-2",
      idempotencyKey: "fixed-key",
    });
    assert.equal(a.caseId, b.caseId);
    assert.equal(caseCount(), 1);
  });

  it("concurrent duplicate requests create one case", async () => {
    resetSupportCaseStore({ delayMs: 40 });
    const results = await Promise.all([
      createSupportCaseService({
        customerId: "ACME",
        summary: "race",
        tenantId: "acme",
        requestId: "req-race",
        openedBy: "op-1",
      }),
      createSupportCaseService({
        customerId: "ACME",
        summary: "race",
        tenantId: "acme",
        requestId: "req-race",
        openedBy: "op-1",
      }),
      createSupportCaseService({
        customerId: "ACME",
        summary: "race",
        tenantId: "acme",
        requestId: "req-race",
        openedBy: "op-1",
      }),
    ]);
    const ids = new Set(results.map((r) => r.caseId));
    assert.equal(ids.size, 1);
    assert.equal(caseCount(), 1);
    assert.ok(results.some((r) => r.replayed === true));
  });

  it("lost response reconciled by replaying same key", async () => {
    const first = await createSupportCaseService({
      customerId: "ACME",
      summary: "timeout after commit",
      tenantId: "acme",
      requestId: "req-lost",
      openedBy: "op-1",
    });
    // Client never saw first; retries with same requestId.
    const retry = await createSupportCaseService({
      customerId: "ACME",
      summary: "timeout after commit",
      tenantId: "acme",
      requestId: "req-lost",
      openedBy: "op-1",
    });
    assert.equal(retry.caseId, first.caseId);
    assert.equal(retry.replayed, true);
    assert.equal(caseCount(), 1);
  });
});

describe("agent duplicate tool call in same run", () => {
  beforeEach(() => {
    resetSupportCaseStore();
  });

  it("model repeating createSupportCase does not duplicate cases", async () => {
    let call = 0;
    const model = {
      async generate(request) {
        call += 1;
        if (call <= 2) {
          return {
            toolCalls: [
              {
                name: "createSupportCase",
                input: {
                  customerId: "ACME",
                  summary: "dup in run",
                },
              },
            ],
          };
        }
        const tools = request.messages.filter((m) => m.role === "tool");
        return {
          text: JSON.stringify(tools.map((t) => t.output)),
        };
      },
    };

    const { agent } = createCaseAgent(model);
    const result = await agent.run("open case", {
      context: {
        tenantId: "acme",
        requestId: "req-agent-dup",
        userId: "op-1",
      },
    });

    assert.equal(caseCount(), 1);
    const outputs = JSON.parse(result.text);
    assert.equal(outputs.length, 2);
    assert.equal(outputs[0].caseId, outputs[1].caseId);
    assert.equal(outputs[0].replayed, false);
    assert.equal(outputs[1].replayed, true);
    assert.equal(listCases()[0].requestId, "req-agent-dup");
  });
});
