import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { parseCases } from "../lib/load-cases.mjs";
import { runEnterpriseSupportEvals } from "../enterprise-support/run.mjs";

const here = dirname(fileURLToPath(import.meta.url));

describe("enterprise-support eval runner", () => {
  it("dataset has at least 20 cases covering planned categories", () => {
    const raw = JSON.parse(
      readFileSync(join(here, "../enterprise-support/cases.json"), "utf8"),
    );
    const cases = parseCases(raw);
    assert.ok(cases.length >= 20, `expected >=20 cases, got ${cases.length}`);

    const categories = new Set(cases.map((c) => c.category));
    for (const needed of ["customer", "security", "support-case", "behavior"]) {
      assert.ok(categories.has(needed), `missing category ${needed}`);
    }
  });

  it("deterministic suite passes and matches baseline shape", async () => {
    const result = await runEnterpriseSupportEvals({ writeBaseline: false });
    assert.equal(result.mode, "deterministic-scripted");
    assert.ok(result.caseCount >= 20);
    assert.equal(
      result.summary.failed,
      0,
      result.humanSummary,
    );
    assert.equal(result.summary.passed, result.summary.total);
    assert.ok(result.summary.metrics.decisionAccuracy.rate === 1);
    assert.ok(result.summary.metrics.requiredToolSelection.rate === 1);
    assert.ok(result.summary.metrics.unnecessaryToolAvoidance.rate === 1);
  });
});
