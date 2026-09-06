#!/usr/bin/env node
/**
 * Demo: Receptionist → specialist with shared AgentEvent → OTel mapping.
 */

import { asAgentTool, createAgent, defineTool } from "@agentstride/core";

import { createInMemoryTracing, summarizeSpans } from "./setup.mjs";
import { createAgentEventTracer } from "./tracing.mjs";

const { exporter, tracer, shutdown } = createInMemoryTracing();
const tracing = createAgentEventTracer({
  tracer,
  modelName: "fake-demo",
  providerName: "agentstride.fake",
});

const lookup = defineTool({
  name: "lookupPolicy",
  description: "Lookup a policy snippet",
  execute() {
    return { policy: "production access requires human approval" };
  },
});

const specialist = createAgent({
  model: {
    async generate(request) {
      if (!request.messages.some((m) => m.role === "tool")) {
        return {
          toolCalls: [{ name: "lookupPolicy", input: {} }],
          usage: { inputTokens: 12, outputTokens: 4, totalTokens: 16 },
        };
      }
      return {
        text: "Risk high; require human approval.",
        usage: { inputTokens: 20, outputTokens: 8, totalTokens: 28 },
      };
    },
  },
  tools: { lookupPolicy: lookup },
  onEvent: tracing.forAgent("security"),
});

const receptionist = createAgent({
  model: {
    async generate(request) {
      if (!request.messages.some((m) => m.role === "tool")) {
        return {
          toolCalls: [
            {
              name: "askSecurity",
              input: { request: "ACME needs production access" },
            },
          ],
          usage: { inputTokens: 10, outputTokens: 3, totalTokens: 13 },
        };
      }
      return {
        text: `Receptionist: ${request.messages.at(-1)?.output}`,
        usage: { inputTokens: 15, outputTokens: 6, totalTokens: 21 },
      };
    },
  },
  tools: {
    askSecurity: asAgentTool(specialist, {
      name: "askSecurity",
      description: "Ask security specialist",
    }),
  },
  onEvent: tracing.forAgent("receptionist"),
});

const result = await receptionist.run(
  "Customer ACME cannot access production. Check policy.",
);
console.log("agent text:", result.text);

const spans = summarizeSpans(exporter.getFinishedSpans());
console.log("\nspans:");
for (const span of spans) {
  console.log(
    `- ${span.name} parent=${span.parentSpanId ?? "root"} attrs=${JSON.stringify(span.attributes)}`,
  );
}

await shutdown();
