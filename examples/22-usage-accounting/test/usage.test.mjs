import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createAgent, defineTool } from "@agentstride/core";

import {
  aggregateUsageFromRun,
  aggregateUsageRows,
  estimateCostUsd,
} from "../usage.mjs";

describe("usage accounting", () => {
  it("aggregates model/tool counts tokens steps and duration from AgentRun", async () => {
    let call = 0;
    const tool = defineTool({
      name: "echo",
      description: "echo",
      execute: () => ({ ok: true }),
    });
    const agent = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return {
              toolCalls: [{ name: "echo", input: {} }],
              usage: { inputTokens: 10, outputTokens: 4, totalTokens: 14 },
            };
          }
          return {
            text: "ok",
            usage: { inputTokens: 5, outputTokens: 2, totalTokens: 7 },
          };
        },
      },
      tools: { echo: tool },
    });

    const run = await agent.run("x");
    const usage = aggregateUsageFromRun(run);
    assert.equal(usage.modelCalls, 2);
    assert.equal(usage.toolCalls, 1);
    assert.equal(usage.inputTokens, 15);
    assert.equal(usage.outputTokens, 6);
    assert.equal(usage.totalTokens, 21);
    assert.equal(usage.steps, 2);
    assert.ok(usage.durationMs >= 0);
    assert.deepEqual(usage.toolNames, ["echo"]);
  });

  it("estimates cost only with external pricing", () => {
    const cost = estimateCostUsd(
      { inputTokens: 1_000_000, outputTokens: 500_000 },
      { inputPer1M: 1, outputPer1M: 2, model: "x", asOf: "2026-09-06" },
    );
    assert.equal(cost.inputCost, 1);
    assert.equal(cost.outputCost, 1);
    assert.equal(cost.totalCost, 2);
    assert.equal(cost.currency, "USD");
  });

  it("rejects missing external pricing", () => {
    assert.throws(() => estimateCostUsd({ inputTokens: 1, outputTokens: 1 }, {}));
  });

  it("aggregates multiple run rows for eval-style reports", () => {
    const summary = aggregateUsageRows([
      {
        steps: 2,
        durationMs: 10,
        modelCalls: 2,
        toolCalls: 1,
        inputTokens: 10,
        outputTokens: 5,
        totalTokens: 15,
      },
      {
        steps: 1,
        durationMs: 5,
        modelCalls: 1,
        toolCalls: 0,
        inputTokens: 3,
        outputTokens: 1,
        totalTokens: 4,
      },
    ]);
    assert.equal(summary.runs, 2);
    assert.equal(summary.modelCalls, 3);
    assert.equal(summary.totalTokens, 19);
  });
});
