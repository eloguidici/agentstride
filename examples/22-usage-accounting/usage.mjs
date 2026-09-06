/**
 * Aggregate usage from an AgentRun. Application/example helper — not core.
 * Does not include provider prices.
 */

/**
 * @param {{ steps?: number, durationMs?: number, events?: Array<{ type: string, usage?: object, toolName?: string }> }} run
 */
export function aggregateUsageFromRun(run) {
  const events = run?.events ?? [];
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  let modelCalls = 0;
  let toolCalls = 0;
  const toolNames = [];

  for (const event of events) {
    if (event.type === "model:end") {
      modelCalls += 1;
      const usage = event.usage ?? {};
      if (typeof usage.inputTokens === "number") inputTokens += usage.inputTokens;
      if (typeof usage.outputTokens === "number") outputTokens += usage.outputTokens;
      if (typeof usage.totalTokens === "number") {
        totalTokens += usage.totalTokens;
      } else if (
        typeof usage.inputTokens === "number" ||
        typeof usage.outputTokens === "number"
      ) {
        totalTokens += (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0);
      }
    }
    if (event.type === "tool:start") {
      toolCalls += 1;
      if (typeof event.toolName === "string") toolNames.push(event.toolName);
    }
  }

  return {
    steps: run?.steps ?? 0,
    durationMs: run?.durationMs ?? 0,
    modelCalls,
    toolCalls,
    toolNames,
    inputTokens,
    outputTokens,
    totalTokens,
  };
}

/**
 * Estimate cost using caller-supplied pricing. Never hard-code rates in core.
 *
 * @param {{ inputTokens: number, outputTokens: number }} usage
 * @param {{ inputPer1M: number, outputPer1M: number, currency?: string }} pricing
 */
export function estimateCostUsd(usage, pricing) {
  if (!pricing || typeof pricing.inputPer1M !== "number" || typeof pricing.outputPer1M !== "number") {
    throw new Error("pricing.inputPer1M and pricing.outputPer1M are required");
  }
  const inputCost = (usage.inputTokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (usage.outputTokens / 1_000_000) * pricing.outputPer1M;
  return {
    currency: pricing.currency ?? "USD",
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    pricingAsOf: pricing.asOf ?? null,
    model: pricing.model ?? null,
  };
}

/**
 * @param {Array<ReturnType<typeof aggregateUsageFromRun>>} rows
 */
export function aggregateUsageRows(rows) {
  const summary = {
    runs: rows.length,
    steps: 0,
    durationMs: 0,
    modelCalls: 0,
    toolCalls: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
  for (const row of rows) {
    summary.steps += row.steps;
    summary.durationMs += row.durationMs;
    summary.modelCalls += row.modelCalls;
    summary.toolCalls += row.toolCalls;
    summary.inputTokens += row.inputTokens;
    summary.outputTokens += row.outputTokens;
    summary.totalTokens += row.totalTokens;
  }
  return summary;
}
