/**
 * Deterministic scorers for a single evaluation case.
 */

/**
 * @typedef {object} ScoreCheck
 * @property {string} name
 * @property {boolean} pass
 * @property {string} [detail]
 */

/**
 * @typedef {object} CaseScore
 * @property {string} caseId
 * @property {boolean} pass
 * @property {ScoreCheck[]} checks
 * @property {string[]} failures
 */

/**
 * Score one case result against expectations.
 *
 * @param {object} params
 * @param {object} params.caseDef
 * @param {{ status?: string, output?: object, events?: object[] } | null} params.run
 * @param {Error | null} params.error
 * @param {string[]} params.toolsCalled
 * @param {string[]} [params.nestedToolsCalled]
 * @returns {CaseScore}
 */
export function scoreCase({
  caseDef,
  run,
  error,
  toolsCalled,
  nestedToolsCalled = [],
}) {
  const expected = caseDef.expected;
  const checks = [];
  const wantStatus = expected.status ?? "completed";

  if (wantStatus === "failed") {
    checks.push({
      name: "run-failed",
      pass: error != null || run?.status === "failed",
      detail: error
        ? `${error.name}: ${error.message}`
        : `status=${run?.status ?? "none"}`,
    });

    if (typeof expected.errorIncludes === "string") {
      const hay = `${error?.name ?? ""} ${error?.message ?? ""} ${run?.error?.message ?? ""}`;
      checks.push({
        name: "error-includes",
        pass: hay.toLowerCase().includes(expected.errorIncludes.toLowerCase()),
        detail: hay.slice(0, 200),
      });
    }

    if (typeof expected.errorName === "string") {
      checks.push({
        name: "error-name",
        pass: error?.name === expected.errorName || run?.error?.name === expected.errorName,
        detail: `got ${error?.name ?? run?.error?.name ?? "none"}`,
      });
    }
  } else {
    checks.push({
      name: "run-completed",
      pass: error == null && run?.status === "completed",
      detail: error
        ? `${error.name}: ${error.message}`
        : `status=${run?.status ?? "none"}`,
    });

    const output = run?.output;
    checks.push({
      name: "structured-output-present",
      pass: output != null && typeof output === "object",
      detail: output == null ? "missing output" : "ok",
    });

    if (output != null) {
      checks.push({
        name: "decision",
        pass: output.decision === expected.decision,
        detail: `expected ${expected.decision}, got ${output.decision}`,
      });

      checks.push({
        name: "requiresHumanApproval",
        pass: output.requiresHumanApproval === expected.requiresHumanApproval,
        detail: `expected ${expected.requiresHumanApproval}, got ${output.requiresHumanApproval}`,
      });

      if (expected.risk !== undefined) {
        checks.push({
          name: "risk",
          pass: output.risk === expected.risk,
          detail: `expected ${expected.risk}, got ${output.risk}`,
        });
      }

      if (expected.customerId !== undefined) {
        checks.push({
          name: "customerId",
          pass: output.customerId === expected.customerId,
          detail: `expected ${expected.customerId}, got ${output.customerId}`,
        });
      }

      if (expected.caseIdNull === true) {
        checks.push({
          name: "caseId-null",
          pass: output.caseId == null,
          detail: `got ${output.caseId}`,
        });
      }

      if (expected.caseIdPresent === true) {
        checks.push({
          name: "caseId-present",
          pass: typeof output.caseId === "string" && output.caseId.length > 0,
          detail: `got ${output.caseId}`,
        });
      }
    }
  }

  const called = new Set(toolsCalled);
  for (const name of expected.mustCall ?? []) {
    checks.push({
      name: `mustCall:${name}`,
      pass: called.has(name),
      detail: called.has(name) ? "called" : `missing; called=[${[...called].join(",")}]`,
    });
  }

  for (const name of expected.mustNotCall ?? []) {
    checks.push({
      name: `mustNotCall:${name}`,
      pass: !called.has(name),
      detail: called.has(name) ? "was called" : "ok",
    });
  }

  const nested = new Set(nestedToolsCalled);
  for (const name of expected.mustCallNested ?? []) {
    checks.push({
      name: `mustCallNested:${name}`,
      pass: nested.has(name),
      detail: nested.has(name)
        ? "called"
        : `missing; nested=[${[...nested].join(",")}]`,
    });
  }

  if (typeof expected.maxSteps === "number" && run != null) {
    checks.push({
      name: "maxSteps",
      pass: run.steps <= expected.maxSteps,
      detail: `steps=${run.steps}, max=${expected.maxSteps}`,
    });
  }

  const failures = checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail ?? "failed"}`);
  return {
    caseId: caseDef.id,
    pass: failures.length === 0,
    checks,
    failures,
  };
}
