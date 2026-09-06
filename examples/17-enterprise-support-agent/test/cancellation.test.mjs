import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AgentAbortError } from "@agentstride/core";

import {
  createReceptionistAgent,
  runReceptionist,
} from "../agents/receptionist.mjs";
import {
  createFakeEnterpriseModel,
  createFakeSecurityModel,
} from "../fake-model.mjs";
import { DEMO_CONTEXT } from "../trace.mjs";

describe("cancellation", () => {
  it("aborts a cooperative tool via AbortSignal", async () => {
    const controller = new AbortController();
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("cancel-probe"),
      { securityModel: createFakeSecurityModel() },
    );

    const pending = runReceptionist(receptionist, "probe", {
      context: DEMO_CONTEXT,
      signal: controller.signal,
    });

    setTimeout(() => controller.abort(new AgentAbortError("request cancelled")), 20);

    await assert.rejects(
      () => pending,
      (error) => {
        assert.ok(
          error instanceof AgentAbortError ||
            /abort/i.test(error.message) ||
            error.name === "AbortError",
        );
        assert.ok(error.agentRun);
        return true;
      },
    );
  });
});
