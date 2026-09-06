import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { aggregateScores, formatHumanSummary } from "../lib/aggregate.mjs";
import { scoreCase } from "../lib/score-case.mjs";

describe("scoreCase", () => {
  const baseCase = {
    id: "t1",
    expected: {
      decision: "needs-human-approval",
      requiresHumanApproval: true,
      risk: "high",
      mustCall: ["askSecurity"],
      mustNotCall: ["slowAuditPing"],
      mustCallNested: ["assessSecurity"],
    },
  };

  it("passes when expectations match", () => {
    const score = scoreCase({
      caseDef: baseCase,
      run: {
        status: "completed",
        steps: 3,
        output: {
          decision: "needs-human-approval",
          requiresHumanApproval: true,
          risk: "high",
          customerId: "ACME",
          caseId: null,
          summary: "ok",
        },
      },
      error: null,
      toolsCalled: ["findCustomer", "askSecurity"],
      nestedToolsCalled: ["assessSecurity"],
    });
    assert.equal(score.pass, true);
    assert.equal(score.failures.length, 0);
  });

  it("fails on wrong decision and reports reason", () => {
    const score = scoreCase({
      caseDef: baseCase,
      run: {
        status: "completed",
        steps: 2,
        output: {
          decision: "ticket-created",
          requiresHumanApproval: false,
          risk: "low",
        },
      },
      error: null,
      toolsCalled: ["askSecurity"],
      nestedToolsCalled: ["assessSecurity"],
    });
    assert.equal(score.pass, false);
    assert.ok(score.failures.some((f) => f.startsWith("decision:")));
  });

  it("fails when required tool missing", () => {
    const score = scoreCase({
      caseDef: baseCase,
      run: {
        status: "completed",
        steps: 1,
        output: {
          decision: "needs-human-approval",
          requiresHumanApproval: true,
          risk: "high",
        },
      },
      error: null,
      toolsCalled: ["findCustomer"],
      nestedToolsCalled: [],
    });
    assert.equal(score.pass, false);
    assert.ok(score.failures.some((f) => f.includes("mustCall:askSecurity")));
  });

  it("scores expected failures", () => {
    const score = scoreCase({
      caseDef: {
        id: "fail",
        expected: {
          status: "failed",
          errorName: "ToolExecutionError",
          errorIncludes: "Permission denied",
          mustCall: ["createSupportCase"],
        },
      },
      run: { status: "failed", steps: 1, events: [] },
      error: Object.assign(new Error("Permission denied for action"), {
        name: "ToolExecutionError",
      }),
      toolsCalled: ["createSupportCase"],
    });
    assert.equal(score.pass, true);
  });
});

describe("aggregateScores", () => {
  it("computes rates only for observed checks", () => {
    const scores = [
      {
        pass: true,
        checks: [
          { name: "decision", pass: true },
          { name: "mustCall:askSecurity", pass: true },
        ],
        failures: [],
        caseId: "a",
      },
      {
        pass: false,
        checks: [
          { name: "decision", pass: false },
          { name: "mustCall:askSecurity", pass: true },
        ],
        failures: ["decision: bad"],
        caseId: "b",
      },
    ];
    const summary = aggregateScores(scores);
    assert.equal(summary.total, 2);
    assert.equal(summary.passed, 1);
    assert.equal(summary.metrics.decisionAccuracy.rate, 0.5);
    assert.equal(summary.metrics.requiredToolSelection.rate, 1);

    const human = formatHumanSummary(summary, scores);
    assert.match(human, /2 cases/);
    assert.match(human, /Failures:/);
    assert.match(human, /b/);
  });
});
