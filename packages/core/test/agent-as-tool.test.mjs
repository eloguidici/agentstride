import assert from "node:assert/strict";
import test from "node:test";

import {
  asAgentTool,
  createAgent,
  ToolInputValidationError,
} from "../dist/index.js";

test("asAgentTool publishes request JSON Schema parameters", () => {
  const nested = createAgent({
    model: {
      async generate() {
        return { text: "ok" };
      },
    },
  });
  const tool = asAgentTool(nested, {
    name: "askSpecialist",
    description: "Ask nested agent",
  });

  assert.equal(tool.parameters?.type, "object");
  assert.deepEqual(tool.parameters?.required, ["request"]);
  assert.equal(tool.parameters?.properties?.request?.type, "string");
});

test("asAgentTool rejects missing request before nested run", async () => {
  let nestedCalls = 0;
  const nested = createAgent({
    model: {
      async generate() {
        nestedCalls += 1;
        return { text: "should not run" };
      },
    },
  });
  const tool = asAgentTool(nested, {
    name: "ask",
    description: "ask",
  });

  await assert.rejects(
    () => tool.execute(/** @type {any} */ ({}), {}),
    (error) => {
      assert.ok(error instanceof ToolInputValidationError);
      assert.equal(nestedCalls, 0);
      return true;
    },
  );
});

test("asAgentTool still forwards parentRunId and returns nested text", async () => {
  let sawParent;
  const specialist = createAgent({
    model: {
      async generate() {
        return { text: "specialist-reply" };
      },
    },
  });
  const original = specialist.run.bind(specialist);
  specialist.run = async (input, opts = {}) => {
    sawParent = opts.parentRunId;
    return original(input, opts);
  };

  const parent = createAgent({
    model: {
      async generate(request) {
        if (request.messages.some((m) => m.role === "tool")) {
          return { text: "done" };
        }
        assert.equal(request.tools[0]?.parameters?.properties?.request?.type, "string");
        return {
          toolCalls: [{ name: "ask", input: { request: "ping" } }],
        };
      },
    },
    tools: {
      ask: asAgentTool(specialist, { name: "ask", description: "ask" }),
    },
  });

  const run = await parent.run("go");
  assert.equal(run.text, "done");
  assert.equal(sawParent, run.id);
});
