import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import {
  StructuredOutputValidationError,
  createAgent,
  defineTool,
} from "../dist/index.js";

test("returns validated structured output from model output field", async () => {
  const schema = z.object({
    risk: z.enum(["low", "medium", "high"]),
    summary: z.string(),
  });

  const model = {
    async generate() {
      return {
        text: "ignored when output is present",
        output: { risk: "low", summary: "All clear" },
      };
    },
  };

  const agent = createAgent({ model });
  const result = await agent.run("Analyze", { output: schema });

  assert.equal(result.status, "completed");
  assert.deepEqual(result.output, { risk: "low", summary: "All clear" });
  assert.ok(result.id.startsWith("run_"));
  assert.ok(result.durationMs >= 0);
});

test("parses structured output from JSON text fallback", async () => {
  const schema = z.object({
    title: z.string(),
  });

  const model = {
    async generate() {
      return { text: '{"title":"Invoice"}' };
    },
  };

  const agent = createAgent({ model });
  const result = await agent.run("Extract", { output: schema });

  assert.deepEqual(result.output, { title: "Invoice" });
});

test("rejects invalid structured output", async () => {
  const schema = z.object({
    score: z.number(),
  });

  const model = {
    async generate() {
      return { text: '{"score":"bad"}' };
    },
  };

  const agent = createAgent({ model });

  await assert.rejects(
    () => agent.run("score it", { output: schema }),
    (error) => error instanceof StructuredOutputValidationError,
  );
});

test("emits lifecycle events and runs hooks", async () => {
  const events = [];
  const hookLog = [];

  const echo = defineTool({
    name: "echo",
    description: "Echo",
    execute(input) {
      return input;
    },
  });

  let calls = 0;
  const model = {
    async generate() {
      calls += 1;
      if (calls === 1) {
        return { toolCalls: [{ name: "echo", input: { ok: true }, id: "t1" }] };
      }
      return { text: "done" };
    },
  };

  const agent = createAgent({
    model,
    tools: { echo },
    onEvent(event) {
      events.push(event.type);
    },
    hooks: {
      beforeRun: () => {
        hookLog.push("beforeRun");
      },
      beforeModel: () => {
        hookLog.push("beforeModel");
      },
      afterModel: () => {
        hookLog.push("afterModel");
      },
      beforeTool: () => {
        hookLog.push("beforeTool");
      },
      afterTool: () => {
        hookLog.push("afterTool");
      },
    },
  });

  const result = await agent.run("hi");

  assert.equal(result.text, "done");
  assert.deepEqual(hookLog, [
    "beforeRun",
    "beforeModel",
    "afterModel",
    "beforeTool",
    "afterTool",
    "beforeModel",
    "afterModel",
  ]);
  assert.ok(events.includes("run:start"));
  assert.ok(events.includes("tool:start"));
  assert.ok(events.includes("run:end"));
});

test("deniedTools guard blocks execution", async () => {
  const blocked = defineTool({
    name: "blocked",
    description: "nope",
    execute() {
      return "x";
    },
  });

  const model = {
    async generate() {
      return { toolCalls: [{ name: "blocked", input: {} }] };
    },
  };

  const agent = createAgent({
    model,
    tools: { blocked },
    deniedTools: ["blocked"],
  });

  await assert.rejects(() => agent.run("go"), /denied by guard/);
});
