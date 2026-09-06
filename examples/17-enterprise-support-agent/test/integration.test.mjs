import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ToolExecutionError } from "@agentstride/core";

import {
  createReceptionistAgent,
  runReceptionist,
} from "../agents/receptionist.mjs";
import {
  createFakeEnterpriseModel,
  createFakeSecurityModel,
} from "../fake-model.mjs";
import { resetSupportCaseService } from "../domain/support-case-service.mjs";
import { DEMO_CONTEXT } from "../trace.mjs";

describe("integration receptionist + security + tools", () => {
  it("emits lifecycle events across delegation", async () => {
    resetSupportCaseService();
    const events = [];
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("happy"),
      {
        securityModel: createFakeSecurityModel(),
        onEvent: (event) => events.push(event),
      },
    );

    const result = await runReceptionist(
      receptionist,
      "Customer ACME cannot access production.",
      { context: DEMO_CONTEXT },
    );

    assert.equal(result.status, "completed");
    const types = events.map((e) => e.type);
    assert.ok(types.includes("run:start"));
    assert.ok(types.includes("model:start"));
    assert.ok(types.includes("tool:start"));
    assert.ok(types.includes("tool:end"));
    assert.ok(types.includes("run:end"));
    assert.ok(events.some((e) => e.type === "tool:start" && e.toolName === "askSecurity"));
    assert.ok(events.some((e) => e.type === "tool:start" && e.toolName === "findCustomer"));
    assert.ok(
      events.some((e) => e.type === "tool:start" && e.toolName === "createSupportCase"),
    );
  });

  it("support tool failure attaches partial agentRun", async () => {
    resetSupportCaseService({ failNextCreate: true });
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("case-fail"),
      { securityModel: createFakeSecurityModel() },
    );

    await assert.rejects(
      () =>
        runReceptionist(receptionist, "ACME production access", {
          context: DEMO_CONTEXT,
        }),
      (error) => {
        assert.ok(error instanceof ToolExecutionError || /unavailable/.test(error.message));
        assert.ok(error.agentRun);
        assert.ok(error.agentRun.steps >= 1);
        assert.equal(error.agentRun.status, "failed");
        assert.ok(error.agentRun.events.some((e) => e.type === "run:error"));
        return true;
      },
    );
  });

  it("model failure attaches agentRun", async () => {
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("model-fail"),
      { securityModel: createFakeSecurityModel() },
    );

    await assert.rejects(
      () =>
        runReceptionist(receptionist, "hello", {
          context: DEMO_CONTEXT,
        }),
      (error) => {
        assert.match(error.message, /model unavailable/);
        assert.ok(error.agentRun);
        assert.equal(error.agentRun.steps, 1);
        return true;
      },
    );
  });
});
