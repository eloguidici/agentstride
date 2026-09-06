import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runChangeGateEvals } from "../change-gate/run.mjs";

describe("change-gate evals", () => {
  it("deterministic Velum Grid suite passes", async () => {
    const result = await runChangeGateEvals({ writeBaseline: false });
    assert.equal(result.summary.failed, 0, result.humanSummary);
    assert.ok(result.caseCount >= 5);
    assert.ok(result.cases.every((c) => c.executed !== true));
  });
});
