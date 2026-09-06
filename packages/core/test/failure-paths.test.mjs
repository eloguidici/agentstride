import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";

import {
  AgentAbortError,
  AgentRunTimeoutError,
  StructuredOutputValidationError,
  ToolExecutionError,
  ToolInputValidationError,
  createAgent,
  defineTool,
} from "../dist/index.js";

function agentRunFrom(error) {
  assert.ok(error && typeof error === "object" && "agentRun" in error);
  return error.agentRun;
}

describe("failure paths and cancellation", () => {
  it("preserves steps/messages/events when model throws after tools", async () => {
    let call = 0;
    const boom = defineTool({
      name: "boomPrep",
      description: "prep",
      execute: () => ({ ok: true }),
    });

    const agent = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return {
              toolCalls: [{ name: "boomPrep", input: {} }],
            };
          }
          throw new Error("model down");
        },
      },
      tools: { boomPrep: boom },
    });

    await assert.rejects(
      () => agent.run("go"),
      (error) => {
        assert.equal(error.message, "model down");
        const run = agentRunFrom(error);
        assert.equal(run.status, "failed");
        assert.equal(run.steps, 2);
        assert.ok(run.events.some((e) => e.type === "tool:end"));
        assert.ok(run.events.some((e) => e.type === "run:error"));
        assert.ok(run.messages.some((m) => m.role === "tool"));
        assert.ok(run.durationMs >= 0);
        return true;
      },
    );
  });

  it("model throw on step 1 keeps steps=1", async () => {
    const agent = createAgent({
      model: {
        async generate() {
          throw new Error("nope");
        },
      },
    });

    await assert.rejects(
      () => agent.run("x"),
      (error) => {
        const run = agentRunFrom(error);
        assert.equal(run.steps, 1);
        assert.ok(run.events.some((e) => e.type === "model:start"));
        return true;
      },
    );
  });

  it("wraps tool throws as ToolExecutionError and keeps progress", async () => {
    const agent = createAgent({
      model: {
        async generate() {
          return { toolCalls: [{ name: "fail", input: {} }] };
        },
      },
      tools: {
        fail: defineTool({
          name: "fail",
          description: "fail",
          execute() {
            throw new Error("tool boom");
          },
        }),
      },
    });

    await assert.rejects(
      () => agent.run("x"),
      (error) => {
        assert.ok(error instanceof ToolExecutionError);
        assert.equal(error.toolName, "fail");
        const run = agentRunFrom(error);
        assert.equal(run.steps, 1);
        assert.ok(run.events.some((e) => e.type === "tool:start"));
        return true;
      },
    );
  });

  it("hook throw attaches partial agentRun", async () => {
    const agent = createAgent({
      model: {
        async generate() {
          return { text: "hi" };
        },
      },
      hooks: {
        beforeModel() {
          throw new Error("hook fail");
        },
      },
    });

    await assert.rejects(
      () => agent.run("x"),
      (error) => {
        assert.equal(error.message, "hook fail");
        assert.equal(agentRunFrom(error).steps, 1);
        return true;
      },
    );
  });

  it("memory load failure preserves run:error", async () => {
    const agent = createAgent({
      model: {
        async generate() {
          return { text: "hi" };
        },
      },
      memory: {
        async load() {
          throw new Error("load failed");
        },
        async save() {},
      },
    });

    await assert.rejects(
      () => agent.run("x", { threadId: "t1" }),
      (error) => {
        assert.equal(error.message, "load failed");
        const run = agentRunFrom(error);
        assert.equal(run.steps, 0);
        assert.ok(run.events.some((e) => e.type === "run:start"));
        return true;
      },
    );
  });

  it("memory save failure after completion path", async () => {
    const agent = createAgent({
      model: {
        async generate() {
          return { text: "done" };
        },
      },
      memory: {
        async load() {
          return [];
        },
        async save() {
          throw new Error("save failed");
        },
      },
    });

    await assert.rejects(
      () => agent.run("x", { threadId: "t1" }),
      (error) => {
        assert.equal(error.message, "save failed");
        const run = agentRunFrom(error);
        assert.equal(run.steps, 1);
        assert.ok(run.messages.some((m) => m.role === "assistant"));
        return true;
      },
    );
  });

  it("timeout during slow model yields AgentRunTimeoutError", async () => {
    const agent = createAgent({
      timeoutMs: 30,
      model: {
        async generate() {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return { text: "late" };
        },
      },
    });

    await assert.rejects(
      () => agent.run("x"),
      (error) => {
        assert.ok(error instanceof AgentRunTimeoutError);
        const run = agentRunFrom(error);
        assert.equal(run.steps, 1);
        return true;
      },
    );
  });

  it("timeout during slow tool yields AgentRunTimeoutError", async () => {
    const agent = createAgent({
      timeoutMs: 40,
      model: {
        async generate() {
          return { toolCalls: [{ name: "slow", input: {} }] };
        },
      },
      tools: {
        slow: defineTool({
          name: "slow",
          description: "slow",
          async execute() {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return { ok: true };
          },
        }),
      },
    });

    await assert.rejects(
      () => agent.run("x"),
      (error) => {
        assert.ok(error instanceof AgentRunTimeoutError);
        assert.equal(agentRunFrom(error).steps, 1);
        return true;
      },
    );
  });

  it("external AbortSignal cancels the run", async () => {
    const controller = new AbortController();
    const agent = createAgent({
      model: {
        async generate({ signal }) {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, 500);
            signal?.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                reject(signal.reason ?? new AgentAbortError());
              },
              { once: true },
            );
          });
          return { text: "nope" };
        },
      },
    });

    const pending = agent.run("x", { signal: controller.signal });
    controller.abort();

    await assert.rejects(
      () => pending,
      (error) => {
        assert.ok(
          error instanceof AgentAbortError ||
            error.name === "AbortError" ||
            error.message.includes("aborted"),
        );
        assert.ok(agentRunFrom(error));
        return true;
      },
    );
  });

  it("passes abortSignal into tool context", async () => {
    let sawSignal = false;
    let call = 0;
    const agent = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return { toolCalls: [{ name: "check", input: {} }] };
          }
          return { text: "done" };
        },
      },
      tools: {
        check: defineTool({
          name: "check",
          description: "check",
          execute(_input, context) {
            sawSignal = context.abortSignal instanceof AbortSignal;
            return { ok: true };
          },
        }),
      },
    });

    const result = await agent.run("x");
    assert.equal(result.status, "completed");
    assert.equal(sawSignal, true);
  });

  it("handles multiple tool calls in one model response", async () => {
    const seen = [];
    let call = 0;
    const agent = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return {
              toolCalls: [
                { name: "a", input: { n: 1 } },
                { name: "b", input: { n: 2 } },
              ],
            };
          }
          return { text: `saw ${seen.join(",")}` };
        },
      },
      tools: {
        a: defineTool({
          name: "a",
          description: "a",
          execute: ({ n }) => {
            seen.push(`a${n}`);
            return n;
          },
        }),
        b: defineTool({
          name: "b",
          description: "b",
          execute: ({ n }) => {
            seen.push(`b${n}`);
            return n;
          },
        }),
      },
    });

    const result = await agent.run("x");
    assert.equal(result.text, "saw a1,b2");
    assert.equal(result.steps, 2);
  });

  it("validates structured output after tool calls", async () => {
    let call = 0;
    const agent = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return { toolCalls: [{ name: "ping", input: {} }] };
          }
          return {
            text: JSON.stringify({ answer: 42 }),
            output: { answer: 42 },
          };
        },
      },
      tools: {
        ping: defineTool({
          name: "ping",
          description: "ping",
          execute: () => ({ pong: true }),
        }),
      },
    });

    const schema = z.object({ answer: z.number() });
    const result = await agent.run("x", { output: schema });
    assert.deepEqual(result.output, { answer: 42 });
  });

  it("rejects invalid structured output after tools", async () => {
    let call = 0;
    const agent = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return { toolCalls: [{ name: "ping", input: {} }] };
          }
          return { text: '{"answer":"nope"}', output: { answer: "nope" } };
        },
      },
      tools: {
        ping: defineTool({
          name: "ping",
          description: "ping",
          execute: () => ({ pong: true }),
        }),
      },
    });

    await assert.rejects(
      () => agent.run("x", { output: z.object({ answer: z.number() }) }),
      (error) => error instanceof StructuredOutputValidationError,
    );
  });

  it("denied tool and unknown tool and invalid schema", async () => {
    const typed = defineTool({
      name: "typed",
      description: "typed",
      inputSchema: z.object({ id: z.string() }),
      execute: ({ id }) => ({ id }),
    });

    const deniedAgent = createAgent({
      deniedTools: ["typed"],
      model: {
        async generate() {
          return { toolCalls: [{ name: "typed", input: { id: "1" } }] };
        },
      },
      tools: { typed },
    });
    await assert.rejects(() => deniedAgent.run("x"), /denied/);

    const unknownAgent = createAgent({
      model: {
        async generate() {
          return { toolCalls: [{ name: "missing", input: {} }] };
        },
      },
    });
    await assert.rejects(() => unknownAgent.run("x"), /unknown tool/);

    const invalidAgent = createAgent({
      model: {
        async generate() {
          return { toolCalls: [{ name: "typed", input: { id: 1 } }] };
        },
      },
      tools: { typed },
    });
    await assert.rejects(
      () => invalidAgent.run("x"),
      (error) => error instanceof ToolInputValidationError,
    );
  });
});
