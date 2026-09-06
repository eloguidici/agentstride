import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseCases, validateCase } from "../lib/load-cases.mjs";

describe("load-cases", () => {
  it("parses a valid case list", () => {
    const cases = parseCases([
      {
        id: "a",
        input: "hello",
        expected: {
          decision: "info-only",
          requiresHumanApproval: false,
        },
      },
    ]);
    assert.equal(cases.length, 1);
  });

  it("rejects duplicate ids", () => {
    assert.throws(
      () =>
        parseCases([
          {
            id: "a",
            input: "x",
            expected: { decision: "info-only", requiresHumanApproval: false },
          },
          {
            id: "a",
            input: "y",
            expected: { decision: "info-only", requiresHumanApproval: false },
          },
        ]),
      /duplicate id/,
    );
  });

  it("rejects invalid decision", () => {
    assert.throws(
      () =>
        validateCase({
          id: "bad",
          input: "x",
          expected: { decision: "approval-required", requiresHumanApproval: true },
        }),
      /expected.decision/,
    );
  });

  it("rejects malformed script steps", () => {
    assert.throws(
      () =>
        validateCase({
          id: "bad-script",
          input: "x",
          expected: { decision: "info-only", requiresHumanApproval: false },
          script: { steps: [{ toolCalls: [], output: { decision: "info-only" } }] },
        }),
      /exactly one of/,
    );
  });

  it("allows failed expectations without decision", () => {
    const c = validateCase({
      id: "fail",
      input: "x",
      expected: { status: "failed", errorName: "ToolExecutionError" },
    });
    assert.equal(c.expected.status, "failed");
  });
});
