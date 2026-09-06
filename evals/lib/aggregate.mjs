/**
 * Aggregate case scores into machine-readable + human summary metrics.
 */

/**
 * @param {Array<{ pass: boolean, checks: Array<{ name: string, pass: boolean }> }>} scores
 */
export function aggregateScores(scores) {
  const total = scores.length;
  const passed = scores.filter((s) => s.pass).length;
  const failed = total - passed;

  const metricDefs = [
    { key: "decisionAccuracy", match: (n) => n === "decision" },
    {
      key: "humanApprovalAccuracy",
      match: (n) => n === "requiresHumanApproval",
    },
    {
      key: "requiredToolSelection",
      match: (n) => n.startsWith("mustCall:") || n.startsWith("mustCallNested:"),
    },
    {
      key: "unnecessaryToolAvoidance",
      match: (n) => n.startsWith("mustNotCall:"),
    },
    {
      key: "structuredOutputValidity",
      match: (n) =>
        n === "structured-output-present" ||
        n === "run-completed" ||
        n === "run-failed",
    },
  ];

  /** @type {Record<string, { pass: number, total: number, rate: number | null }>} */
  const metrics = {};
  for (const def of metricDefs) {
    let pass = 0;
    let count = 0;
    for (const score of scores) {
      for (const check of score.checks) {
        if (def.match(check.name)) {
          count += 1;
          if (check.pass) pass += 1;
        }
      }
    }
    metrics[def.key] = {
      pass,
      total: count,
      rate: count === 0 ? null : pass / count,
    };
  }

  return {
    total,
    passed,
    failed,
    passRate: total === 0 ? null : passed / total,
    metrics,
  };
}

/**
 * @param {ReturnType<typeof aggregateScores>} summary
 * @param {Array<{ caseId: string, pass: boolean, failures: string[] }>} scores
 */
export function formatHumanSummary(summary, scores) {
  const lines = [
    `${summary.total} cases`,
    `${summary.passed} passed`,
    `${summary.failed} failed`,
    "",
  ];

  for (const [key, value] of Object.entries(summary.metrics)) {
    if (value.rate == null) {
      lines.push(`${key}: n/a (no checks)`);
    } else {
      lines.push(`${key}: ${(value.rate * 100).toFixed(0)}% (${value.pass}/${value.total})`);
    }
  }

  const failedCases = scores.filter((s) => !s.pass);
  if (failedCases.length > 0) {
    lines.push("", "Failures:");
    for (const f of failedCases) {
      lines.push(`- ${f.caseId}`);
      for (const reason of f.failures) {
        lines.push(`    ${reason}`);
      }
    }
  }

  return lines.join("\n");
}
