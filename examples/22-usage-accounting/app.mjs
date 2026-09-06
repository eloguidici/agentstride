#!/usr/bin/env node
import { createAgent, defineTool } from "@agentstride/core";

import { aggregateUsageFromRun, estimateCostUsd } from "./usage.mjs";

const ping = defineTool({
  name: "ping",
  description: "ping",
  execute: () => ({ ok: true }),
});

let call = 0;
const model = {
  async generate(request) {
    call += 1;
    if (call === 1) {
      return {
        toolCalls: [{ name: "ping", input: {} }],
        usage: { inputTokens: 11, outputTokens: 3, totalTokens: 14 },
      };
    }
    return {
      text: "done",
      usage: { inputTokens: 9, outputTokens: 2, totalTokens: 11 },
    };
  },
};

const agent = createAgent({ model, tools: { ping } });
const run = await agent.run("go");
const usage = aggregateUsageFromRun(run);
console.log("usage:", usage);

// External pricing snapshot — not stored in core.
const cost = estimateCostUsd(usage, {
  inputPer1M: 0.15,
  outputPer1M: 0.6,
  model: "fake-demo",
  asOf: "2026-09-06",
});
console.log("estimated cost (external pricing):", cost);
