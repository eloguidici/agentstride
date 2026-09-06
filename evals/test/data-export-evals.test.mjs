import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runDataExportEvals } from "../data-export/run.mjs";

describe("data-export evals", () => {
  it("passes without auto-export", async () => {
    const result = await runDataExportEvals({ writeBaseline: false });
    assert.equal(result.summary.failed, 0, result.humanSummary);
    assert.ok(result.cases.every((c) => c.exported !== true));
  });
});
