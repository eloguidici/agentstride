import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runHumanApprovalEvals } from "../human-approval/run.mjs";

describe("human-approval evals", () => {
  it("deterministic suite passes", async () => {
    const result = await runHumanApprovalEvals({ writeBaseline: false });
    assert.equal(result.summary.failed, 0, result.humanSummary);
    assert.ok(result.caseCount >= 3);
    assert.ok(result.cases.every((c) => c.accessGranted !== true));
  });
});
