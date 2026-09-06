import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { asAgentTool, createAgent, defineTool } from "@agentstride/core";

import { createInMemoryTracing } from "../setup.mjs";
import { createAgentEventTracer } from "../tracing.mjs";

describe("AgentEvent → OpenTelemetry mapping", () => {
  it("creates run/model/tool spans with privacy defaults", async () => {
    const { exporter, tracer, shutdown } = createInMemoryTracing();
    const tracing = createAgentEventTracer({
      tracer,
      modelName: "fake",
      providerName: "test",
    });

    const echo = defineTool({
      name: "echo",
      description: "echo",
      execute({ value }) {
        return { value };
      },
    });

    const agent = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "echo", input: { value: "secret-payload" } }],
              usage: { inputTokens: 5, outputTokens: 2, totalTokens: 7 },
            };
          }
          return {
            text: "done",
            usage: { inputTokens: 6, outputTokens: 1, totalTokens: 7 },
          };
        },
      },
      tools: { echo },
      onEvent: tracing.forAgent("demo"),
    });

    const secretInput = "USER SECRET PROMPT should not appear";
    await agent.run(secretInput);

    const spans = exporter.getFinishedSpans();
    const names = spans.map((s) => s.name);
    assert.ok(names.some((n) => n.startsWith("invoke_agent")));
    assert.ok(names.some((n) => n.startsWith("chat")));
    assert.ok(names.some((n) => n === "execute_tool echo"));

    const runSpan = spans.find((s) => s.name === "invoke_agent demo");
    assert.ok(runSpan);
    assert.equal(runSpan.attributes["gen_ai.operation.name"], "invoke_agent");
    assert.equal(runSpan.attributes["gen_ai.agent.name"], "demo");
    assert.equal(runSpan.attributes["agentstride.run.input_chars"], secretInput.length);
    assert.equal(runSpan.attributes["agentstride.run.input"], undefined);

    const toolSpan = spans.find((s) => s.name === "execute_tool echo");
    assert.ok(toolSpan);
    assert.equal(toolSpan.attributes["gen_ai.tool.name"], "echo");
    const attrKeys = Object.keys(toolSpan.attributes);
    assert.ok(!attrKeys.some((k) => /argument|payload|input\.value/i.test(k)));

    const chatSpan = spans.find((s) => s.name.startsWith("chat"));
    assert.ok(chatSpan);
    assert.equal(chatSpan.attributes["gen_ai.usage.input_tokens"], 5);

    const serialized = JSON.stringify(spans.map((s) => s.attributes));
    assert.equal(serialized.includes("SECRET"), false);
    assert.equal(serialized.includes("secret-payload"), false);

    await shutdown();
  });

  it("links nested specialist span under parent via parentRunId", async () => {
    const { exporter, tracer, shutdown } = createInMemoryTracing();
    const tracing = createAgentEventTracer({ tracer, modelName: "fake" });

    const specialist = createAgent({
      model: {
        async generate() {
          return { text: "nested-ok" };
        },
      },
      onEvent: tracing.forAgent("security"),
    });

    const parent = createAgent({
      model: {
        async generate(request) {
          if (!request.messages.some((m) => m.role === "tool")) {
            return {
              toolCalls: [{ name: "ask", input: { request: "x" } }],
            };
          }
          return { text: "parent-ok" };
        },
      },
      tools: {
        ask: asAgentTool(specialist, { name: "ask", description: "ask" }),
      },
      onEvent: tracing.forAgent("receptionist"),
    });

    await parent.run("delegate");

    const spans = exporter.getFinishedSpans();
    const parentRun = spans.find((s) => s.name === "invoke_agent receptionist");
    const childRun = spans.find((s) => s.name === "invoke_agent security");
    assert.ok(parentRun);
    assert.ok(childRun);

    const parentSpanId = parentRun.spanContext().spanId;
    const childParent = childRun.parentSpanId;
    assert.equal(childParent, parentSpanId);
    assert.equal(
      childRun.attributes["agentstride.run.parent_id"],
      parentRun.attributes["agentstride.run.id"],
    );

    await shutdown();
  });

  it("marks failed runs with error status", async () => {
    const { exporter, tracer, shutdown } = createInMemoryTracing();
    const tracing = createAgentEventTracer({ tracer });

    const agent = createAgent({
      model: {
        async generate() {
          throw new Error("upstream down");
        },
      },
      onEvent: tracing.forAgent("failing"),
    });

    await assert.rejects(() => agent.run("x"));

    const spans = exporter.getFinishedSpans();
    const runSpan = spans.find((s) => s.name === "invoke_agent failing");
    assert.ok(runSpan);
    assert.equal(runSpan.status.code, 2); // SpanStatusCode.ERROR
    assert.match(runSpan.status.message ?? "", /upstream down/);
    assert.equal(runSpan.attributes["error.type"], "Error");
    assert.equal(runSpan.attributes["agentstride.run.status"], "failed");

    await shutdown();
  });

  it("includeInput opt-in records prompt text", async () => {
    const { exporter, tracer, shutdown } = createInMemoryTracing();
    const tracing = createAgentEventTracer({
      tracer,
      includeInput: true,
    });

    const agent = createAgent({
      model: {
        async generate() {
          return { text: "ok" };
        },
      },
      onEvent: tracing.forAgent("optin"),
    });

    await agent.run("explicit-prompt");
    const runSpan = exporter
      .getFinishedSpans()
      .find((s) => s.name === "invoke_agent optin");
    assert.equal(runSpan.attributes["agentstride.run.input"], "explicit-prompt");

    await shutdown();
  });
});
