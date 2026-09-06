/**
 * Extract tool names observed during a run.
 */

/**
 * @param {Array<{ type: string, toolName?: string }>} events
 * @returns {string[]}
 */
export function toolNamesFromEvents(events) {
  const names = [];
  for (const event of events ?? []) {
    if (event.type === "tool:start" && typeof event.toolName === "string") {
      names.push(event.toolName);
    }
  }
  return names;
}

/**
 * Unique tool names preserving first-seen order.
 * @param {string[]} names
 */
export function uniqueToolNames(names) {
  const seen = new Set();
  const out = [];
  for (const name of names) {
    if (!seen.has(name)) {
      seen.add(name);
      out.push(name);
    }
  }
  return out;
}
