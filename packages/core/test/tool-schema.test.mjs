import assert from "node:assert/strict";
import test from "node:test";

import { z } from "zod";

import {
  createAgent,
  defineTool,
  ToolInputValidationError,
} from "../dist/index.js";

test("infers parameters JSON Schema from a Standard JSON Schema tool", () => {
  const findCustomer = defineTool({
    name: "findCustomer",
    description: "Find a customer by id",
    inputSchema: z.object({
      id: z.string(),
    }),
    execute({ id }) {
      return { id, name: "Ada" };
    },
  });

  assert.equal(findCustomer.parameters?.type, "object");
  assert.deepEqual(findCustomer.parameters?.required, ["id"]);
  assert.equal(
    findCustomer.parameters?.properties?.id?.type,
    "string",
  );
});

test("validates tool input before execute", async () => {
  const calls = [];

  const findCustomer = defineTool({
    name: "findCustomer",
    description: "Find a customer by id",
    inputSchema: z.object({
      id: z.string(),
    }),
    execute(input) {
      calls.push(input);
      return { id: input.id, name: "Ada" };
    },
  });

  const model = {
    async generate(request) {
      if (request.messages.some((message) => message.role === "tool")) {
        return { text: "ok" };
      }

      assert.equal(request.tools[0]?.parameters?.type, "object");

      return {
        toolCalls: [
          {
            name: "findCustomer",
            input: { id: "42" },
          },
        ],
      };
    },
  };

  const agent = createAgent({
    model,
    tools: { findCustomer },
  });

  const result = await agent.run("Find customer 42");

  assert.equal(result.text, "ok");
  assert.deepEqual(calls, [{ id: "42" }]);
});

test("rejects invalid tool input before execute", async () => {
  let executed = false;

  const findCustomer = defineTool({
    name: "findCustomer",
    description: "Find a customer by id",
    inputSchema: z.object({
      id: z.string(),
    }),
    execute() {
      executed = true;
      return { ok: true };
    },
  });

  const model = {
    async generate() {
      return {
        toolCalls: [
          {
            name: "findCustomer",
            input: { id: 42 },
          },
        ],
      };
    },
  };

  const agent = createAgent({
    model,
    tools: { findCustomer },
  });

  await assert.rejects(
    () => agent.run("Find customer 42"),
    (error) => {
      assert.equal(executed, false);
      assert.ok(error instanceof ToolInputValidationError);
      assert.equal(error.toolName, "findCustomer");
      assert.match(error.message, /Invalid input for tool "findCustomer"/);
      assert.ok(error.issues.length > 0);
      return true;
    },
  );
});

test("keeps tools without inputSchema unvalidated", async () => {
  const loose = defineTool({
    name: "loose",
    description: "Accept anything",
    execute(input) {
      return input;
    },
  });

  const model = {
    async generate(request) {
      if (request.messages.some((message) => message.role === "tool")) {
        const toolMessage = request.messages.at(-1);
        assert.deepEqual(toolMessage.output, { anything: true });
        return { text: "done" };
      }

      return {
        toolCalls: [{ name: "loose", input: { anything: true } }],
      };
    },
  };

  const agent = createAgent({
    model,
    tools: { loose },
  });

  const result = await agent.run("go");
  assert.equal(result.text, "done");
});
