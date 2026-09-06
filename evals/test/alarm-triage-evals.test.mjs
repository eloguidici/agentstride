import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { runAlarmTriageEvals } from "../alarm-triage/run.mjs";

describe("alarm-triage evals", () => {
  it("deterministic Velum Grid suite passes", async () => {
    const result = await runAlarmTriageEvals({ writeBaseline: false });
    assert.equal(result.summary.failed, 0, result.humanSummary);
    assert.ok(result.caseCount >= 7);
    assert.ok(result.cases.every((c) => c.paged !== true));
  });
});
