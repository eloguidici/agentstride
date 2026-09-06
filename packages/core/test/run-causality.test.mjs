import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AgentAbortError,
  asAgentTool,
  createAgent,
  defineTool,
} from "../dist/index.js";

describe("run causality (parentRunId)", () => {
  it("top-level run has no parentRunId", async () => {
    const agent = createAgent({
      model: {
        async generate() {
          return { text: "root" };
        },
      },
    });

    const result = await agent.run("hello");
    assert.equal(result.parentRunId, undefined);
    const start = result.events.find((e) => e.type === "run:start");
    assert.ok(start);
    assert.equal(start.parentRunId, undefined);
  });

  it("nested asAgentTool run sets parentRunId to parent id", async () => {
    let nestedRun = null;
    const nestedEvents = [];
    const specialistTracked = createAgent({
      model: {
        async generate() {
          return { text: "child-text" };
        },
      },
      onEvent: (event) => nestedEvents.push(event),
    });

    const specialistLike = {
      async run(input, options) {
        nestedRun = await specialistTracked.run(input, options);
        return nestedRun;
      },
    };

    const parent = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "ask", input: { request: "x" } }],
            };
          }
          return { text: "parent-done" };
        },
      },
      tools: {
        ask: asAgentTool(specialistLike, { name: "ask", description: "ask" }),
      },
    });

    const parentRun = await parent.run("go");
    assert.equal(parentRun.parentRunId, undefined);
    assert.ok(nestedRun);
    assert.equal(nestedRun.parentRunId, parentRun.id);
    const nestedStart = nestedEvents.find((e) => e.type === "run:start");
    assert.equal(nestedStart.parentRunId, parentRun.id);
  });

  it("sibling nested runs share the same parentRunId", async () => {
    const nestedParents = [];
    const makeChild = (label) => ({
      async run(input, options) {
        nestedParents.push(options?.parentRunId);
        return { text: label, id: `child_${label}`, status: "completed" };
      },
    });

    let step = 0;
    const parent = createAgent({
      model: {
        async generate(request) {
          step += 1;
          if (step === 1) {
            return {
              toolCalls: [
                { name: "askA", input: { request: "a" } },
                { name: "askB", input: { request: "b" } },
              ],
            };
          }
          return { text: "done" };
        },
      },
      tools: {
        askA: asAgentTool(makeChild("a"), { name: "askA", description: "a" }),
        askB: asAgentTool(makeChild("b"), { name: "askB", description: "b" }),
      },
    });

    const parentRun = await parent.run("go");
    assert.equal(nestedParents.length, 2);
    assert.equal(nestedParents[0], parentRun.id);
    assert.equal(nestedParents[1], parentRun.id);
  });

  it("depth > 1 keeps the parent chain", async () => {
    const runs = [];

    const leaf = {
      async run(input, options) {
        const result = await createAgent({
          model: {
            async generate() {
              return { text: "leaf" };
            },
          },
        }).run(input, options);
        runs.push(result);
        return result;
      },
    };

    const mid = {
      async run(input, options) {
        const agent = createAgent({
          model: {
            async generate(request) {
              if (!request.messages.some((m) => m.role === "tool")) {
                return {
                  toolCalls: [{ name: "askLeaf", input: { request: "z" } }],
                };
              }
              return { text: "mid" };
            },
          },
          tools: {
            askLeaf: asAgentTool(leaf, { name: "askLeaf", description: "leaf" }),
          },
        });
        const result = await agent.run(input, options);
        runs.push(result);
        return result;
      },
    };

    const root = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "askMid", input: { request: "y" } }],
            };
          }
          return { text: "root" };
        },
      },
      tools: {
        askMid: asAgentTool(mid, { name: "askMid", description: "mid" }),
      },
    });

    const rootRun = await root.run("go");
    assert.equal(rootRun.parentRunId, undefined);

    const midRun = runs.find((r) => r.text === "mid");
    const leafRun = runs.find((r) => r.text === "leaf");
    assert.ok(midRun);
    assert.ok(leafRun);
    assert.equal(midRun.parentRunId, rootRun.id);
    assert.equal(leafRun.parentRunId, midRun.id);
  });

  it("failed nested run retains parentRunId", async () => {
    let parentId = null;
    let nestedAgentRun = null;

    const specialist = {
      async run(input, options) {
        parentId = options?.parentRunId ?? null;
        try {
          return await createAgent({
            model: {
              async generate() {
                throw new Error("nested boom");
              },
            },
          }).run(input, options);
        } catch (error) {
          nestedAgentRun = error.agentRun;
          throw error;
        }
      },
    };

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

    await assert.rejects(() => parent.run("go"));
    assert.ok(typeof parentId === "string");
    assert.equal(nestedAgentRun.parentRunId, parentId);
    assert.equal(nestedAgentRun.status, "failed");
  });

  it("cancelled nested run retains parentRunId", async () => {
    let nestedAgentRun = null;
    const specialist = {
      async run(input, options) {
        try {
          return await createAgent({
            model: {
              async generate({ signal }) {
                await new Promise((_, reject) => {
                  const timer = setTimeout(() => reject(new Error("too slow")), 500);
                  signal?.addEventListener(
                    "abort",
                    () => {
                      clearTimeout(timer);
                      reject(
                        signal.reason instanceof Error
                          ? signal.reason
                          : new AgentAbortError(),
                      );
                    },
                    { once: true },
                  );
                });
                return { text: "nope" };
              },
            },
          }).run(input, options);
        } catch (error) {
          nestedAgentRun = error.agentRun;
          throw error;
        }
      },
    };

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
    const pending = parent.run("go", { signal: controller.signal });
    await new Promise((r) => setTimeout(r, 20));
    controller.abort(new AgentAbortError("cancel"));
    await assert.rejects(() => pending);
    assert.ok(nestedAgentRun);
    assert.ok(typeof nestedAgentRun.parentRunId === "string");
  });
});
