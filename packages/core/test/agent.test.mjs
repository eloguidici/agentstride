import assert from "node:assert/strict";
import test from "node:test";

import { createAgent, defineTool } from "../dist/index.js";

test("returns a model response when no tool is requested", async () => {
  const model = {
    async generate() {
      return { text: "hello" };
    },
  };

  const agent = createAgent({ model });
  const result = await agent.run("hi");

  assert.equal(result.text, "hello");
  assert.equal(result.steps, 1);
});

test("executes a tool and sends its result back to the model", async () => {
  const requests = [];

  const findCustomer = defineTool({
    name: "findCustomer",
    description: "Find a customer by id",
    execute(input, context) {
      assert.equal(context.tenantId, "acme");
      return { id: input.id, name: "Ada" };
    },
  });

  const model = {
    async generate(request) {
      requests.push(request);

      if (requests.length === 1) {
        return {
          toolCalls: [
            {
              id: "call-1",
              name: "findCustomer",
              input: { id: "42" },
            },
          ],
        };
      }

      const toolMessage = request.messages.at(-1);
      assert.deepEqual(toolMessage.output, { id: "42", name: "Ada" });

      return { text: "Found Ada" };
    },
  };

  const agent = createAgent({
    model,
    tools: { findCustomer },
  });

  const result = await agent.run("Find customer 42", {
    context: { tenantId: "acme" },
  });

  assert.equal(result.text, "Found Ada");
  assert.equal(result.steps, 2);
});

test("fails when a model requests a tool that is not registered", async () => {
  const model = {
    async generate() {
      return {
        toolCalls: [{ name: "missingTool", input: {} }],
      };
    },
  };

  const agent = createAgent({ model });

  await assert.rejects(
    () => agent.run("do something"),
    /Model requested unknown tool: missingTool/,
  );
});

test("stops runaway loops with maxSteps", async () => {
  const loop = defineTool({
    name: "loop",
    description: "Keep looping",
    execute() {
      return "again";
    },
  });

  const model = {
    async generate() {
      return {
        toolCalls: [{ name: "loop", input: {} }],
      };
    },
  };

  const agent = createAgent({
    model,
    tools: { loop },
    maxSteps: 2,
  });

  await assert.rejects(
    () => agent.run("loop"),
    /Agent exceeded maxSteps \(2\)/,
  );
});
