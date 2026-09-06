import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ABORT_SIGNAL_CONTEXT_KEY,
  AgentAbortError,
  asAgentTool,
  createAgent,
  defineTool,
} from "../dist/index.js";

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(
        signal?.reason instanceof Error
          ? signal.reason
          : new AgentAbortError("sleep aborted"),
      );
    };
    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

describe("nested cancellation via asAgentTool", () => {
  it("forwards parent AbortSignal into nested agent.run", async () => {
    let nestedSawSignal = false;
    let nestedAborted = false;

    const specialist = createAgent({
      model: {
        async generate(request) {
          nestedSawSignal = request.signal instanceof AbortSignal;
          try {
            await sleep(500, request.signal);
            return { text: "should not finish" };
          } catch (error) {
            nestedAborted = true;
            throw error;
          }
        },
      },
    });

    const receptionist = createAgent({
      model: {
        async generate() {
          return {
            toolCalls: [{ name: "askSpecialist", input: { request: "slow" } }],
          };
        },
      },
      tools: {
        askSpecialist: asAgentTool(specialist, {
          name: "askSpecialist",
          description: "delegate",
        }),
      },
    });

    const controller = new AbortController();
    const runPromise = receptionist.run("go", { signal: controller.signal });
    await sleep(30);
    controller.abort(new AgentAbortError("outer cancel"));

    await assert.rejects(
      () => runPromise,
      (error) => {
        assert.ok(
          error instanceof AgentAbortError || /abort|cancel/i.test(error.message),
        );
        assert.ok(error.agentRun);
        assert.equal(error.agentRun.status, "failed");
        return true;
      },
    );

    assert.equal(nestedSawSignal, true);
    assert.equal(nestedAborted, true);
  });

  it("nested tools observe abortSignal from the nested run", async () => {
    let nestedToolSawSignal = false;
    let nestedToolAborted = false;

    const probe = defineTool({
      name: "slowProbe",
      description: "honors abortSignal",
      async execute(_input, context) {
        const signal = context[ABORT_SIGNAL_CONTEXT_KEY];
        nestedToolSawSignal = signal instanceof AbortSignal;
        try {
          await sleep(500, signal);
          return { ok: true };
        } catch (error) {
          nestedToolAborted = true;
          throw error;
        }
      },
    });

    const specialist = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "slowProbe", input: {} }],
            };
          }
          return { text: "done" };
        },
      },
      tools: { slowProbe: probe },
    });

    const parent = createAgent({
      model: {
        async generate() {
          return {
            toolCalls: [{ name: "ask", input: { request: "probe" } }],
          };
        },
      },
      tools: {
        ask: asAgentTool(specialist, { name: "ask", description: "ask" }),
      },
    });

    const controller = new AbortController();
    const runPromise = parent.run("go", { signal: controller.signal });
    await sleep(30);
    controller.abort();

    await assert.rejects(() => runPromise);
    assert.equal(nestedToolSawSignal, true);
    assert.equal(nestedToolAborted, true);
  });

  it("successful delegation still returns nested text", async () => {
    const specialist = createAgent({
      model: {
        async generate() {
          return { text: "specialist-ok" };
        },
      },
    });

    const parent = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "ask", input: { request: "hi" } }],
            };
          }
          return { text: `parent got: ${request.messages.at(-1)?.output}` };
        },
      },
      tools: {
        ask: asAgentTool(specialist, { name: "ask", description: "ask" }),
      },
    });

    const result = await parent.run("go");
    assert.equal(result.status, "completed");
    assert.match(result.text, /specialist-ok/);
  });

  it("forwards parent context into nested run", async () => {
    let nestedTenant = null;
    let call = 0;
    const specialistWithTool = createAgent({
      model: {
        async generate() {
          call += 1;
          if (call === 1) {
            return { toolCalls: [{ name: "peek", input: {} }] };
          }
          return { text: "ok" };
        },
      },
      tools: {
        peek: defineTool({
          name: "peek",
          description: "peek context",
          execute(_input, context) {
            nestedTenant = context.tenantId;
            return { ok: true };
          },
        }),
      },
    });

    const parent = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "ask", input: { request: "x" } }],
            };
          }
          return { text: "done" };
        },
      },
      tools: {
        ask: asAgentTool(specialistWithTool, {
          name: "ask",
          description: "ask",
        }),
      },
    });

    await parent.run("go", { context: { tenantId: "acme-nest" } });
    assert.equal(nestedTenant, "acme-nest");
  });

  it("without parent signal, nested run still works (no-signal unchanged)", async () => {
    const specialist = createAgent({
      model: {
        async generate(request) {
          // Internal deadline controller still exists; no external abort.
          assert.ok(request.signal instanceof AbortSignal);
          assert.equal(request.signal.aborted, false);
          return { text: "no-signal-ok" };
        },
      },
    });

    const parent = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "ask", input: { request: "x" } }],
            };
          }
          return { text: String(request.messages.at(-1)?.output) };
        },
      },
      tools: {
        ask: asAgentTool(specialist, { name: "ask", description: "ask" }),
      },
    });

    const result = await parent.run("go");
    assert.equal(result.text, "no-signal-ok");
  });

  it("already-aborted parent signal fails before nested work starts", async () => {
    let nestedStarted = false;
    const specialist = createAgent({
      model: {
        async generate() {
          nestedStarted = true;
          return { text: "late" };
        },
      },
    });

    const parent = createAgent({
      model: {
        async generate() {
          return {
            toolCalls: [{ name: "ask", input: { request: "x" } }],
          };
        },
      },
      tools: {
        ask: asAgentTool(specialist, { name: "ask", description: "ask" }),
      },
    });

    const controller = new AbortController();
    controller.abort(new AgentAbortError("pre-aborted"));

    await assert.rejects(
      () => parent.run("go", { signal: controller.signal }),
      (error) => {
        assert.ok(error instanceof AgentAbortError || error.agentRun);
        return true;
      },
    );
    assert.equal(nestedStarted, false);
  });
});
