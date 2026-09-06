/**
 * Load and validate evaluation case definitions.
 */

const DECISIONS = new Set([
  "ticket-created",
  "needs-human-approval",
  "customer-not-found",
  "permission-denied",
  "info-only",
]);

const STATUSES = new Set(["completed", "failed"]);

/**
 * @param {unknown} raw
 * @returns {object[]}
 */
export function parseCases(raw) {
  if (!Array.isArray(raw)) {
    throw new Error("cases must be a JSON array");
  }
  if (raw.length === 0) {
    throw new Error("cases array is empty");
  }

  const ids = new Set();
  return raw.map((item, index) => validateCase(item, index, ids));
}

/**
 * @param {unknown} item
 * @param {number} index
 * @param {Set<string>} ids
 */
export function validateCase(item, index, ids = new Set()) {
  if (!item || typeof item !== "object") {
    throw new Error(`case[${index}]: expected object`);
  }

  const c = /** @type {Record<string, unknown>} */ (item);
  const id = c.id;
  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`case[${index}]: missing id`);
  }
  if (ids.has(id)) {
    throw new Error(`case[${index}]: duplicate id "${id}"`);
  }
  ids.add(id);

  if (typeof c.input !== "string" || c.input.length === 0) {
    throw new Error(`case "${id}": input must be a non-empty string`);
  }

  if (!c.expected || typeof c.expected !== "object") {
    throw new Error(`case "${id}": expected must be an object`);
  }

  const expected = /** @type {Record<string, unknown>} */ (c.expected);
  const status = expected.status ?? "completed";
  if (typeof status !== "string" || !STATUSES.has(status)) {
    throw new Error(`case "${id}": expected.status must be completed|failed`);
  }

  if (status === "completed") {
    if (typeof expected.decision !== "string" || !DECISIONS.has(expected.decision)) {
      throw new Error(
        `case "${id}": expected.decision must be one of ${[...DECISIONS].join(", ")}`,
      );
    }
    if (typeof expected.requiresHumanApproval !== "boolean") {
      throw new Error(`case "${id}": expected.requiresHumanApproval must be boolean`);
    }
  }

  for (const key of ["mustCall", "mustNotCall", "mustCallNested"]) {
    const value = expected[key];
    if (value !== undefined && !isStringArray(value)) {
      throw new Error(`case "${id}": expected.${key} must be string[]`);
    }
  }

  if (c.script !== undefined) {
    validateScript(c.script, id);
  }

  if (c.securityScript !== undefined) {
    validateScript(c.securityScript, id, "securityScript");
  }

  return c;
}

function validateScript(script, id, label = "script") {
  if (!script || typeof script !== "object") {
    throw new Error(`case "${id}": ${label} must be an object`);
  }
  const steps = /** @type {Record<string, unknown>} */ (script).steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error(`case "${id}": ${label}.steps must be a non-empty array`);
  }
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    if (!step || typeof step !== "object") {
      throw new Error(`case "${id}": ${label}.steps[${i}] must be an object`);
    }
    const s = /** @type {Record<string, unknown>} */ (step);
    const hasTools = Array.isArray(s.toolCalls);
    const hasOutput = s.output !== undefined;
    const hasText = typeof s.text === "string";
    const hasThrow = typeof s.throw === "string";
    if ([hasTools, hasOutput, hasText, hasThrow].filter(Boolean).length !== 1) {
      throw new Error(
        `case "${id}": ${label}.steps[${i}] must have exactly one of toolCalls|output|text|throw`,
      );
    }
  }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
