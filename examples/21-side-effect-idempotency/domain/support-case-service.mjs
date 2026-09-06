/**
 * Pure domain — idempotent support-case creation.
 * Key: tenantId + requestId + actionType (or explicit idempotencyKey).
 */

/** @type {Map<string, object>} */
let casesByKey = new Map();
/** @type {Map<string, Promise<object>>} */
let inflight = new Map();
let seq = 1000;
let artificialDelayMs = 0;

export function resetSupportCaseStore({ delayMs = 0 } = {}) {
  casesByKey = new Map();
  inflight = new Map();
  seq = 1000;
  artificialDelayMs = delayMs;
}

export function idempotencyKeyFor({
  tenantId,
  requestId,
  actionType = "createSupportCase",
  idempotencyKey,
}) {
  if (idempotencyKey) return String(idempotencyKey);
  return `${tenantId}:${requestId}:${actionType}`;
}

/**
 * Create a support case at most once per idempotency key.
 * Concurrent callers with the same key share one in-flight create.
 */
export async function createSupportCaseService({
  customerId,
  summary,
  tenantId,
  requestId,
  openedBy,
  idempotencyKey,
}) {
  const key = idempotencyKeyFor({
    tenantId,
    requestId,
    idempotencyKey,
  });

  const existing = casesByKey.get(key);
  if (existing) {
    return { ...existing, replayed: true };
  }

  const pending = inflight.get(key);
  if (pending) {
    const shared = await pending;
    return { ...shared, replayed: true };
  }

  const createPromise = (async () => {
    if (artificialDelayMs > 0) {
      await new Promise((r) => setTimeout(r, artificialDelayMs));
    }
    // Re-check after await (lost-response / concurrent window).
    const again = casesByKey.get(key);
    if (again) {
      return { ...again, replayed: true };
    }
    seq += 1;
    const created = {
      caseId: `CASE-${seq}`,
      customerId: String(customerId),
      summary: String(summary),
      tenantId: String(tenantId),
      requestId: String(requestId),
      openedBy: String(openedBy),
      status: "open",
      idempotencyKey: key,
      replayed: false,
    };
    casesByKey.set(key, created);
    return created;
  })();

  inflight.set(key, createPromise);
  try {
    return await createPromise;
  } finally {
    inflight.delete(key);
  }
}

export function listCases() {
  return [...casesByKey.values()].map((c) => ({ ...c }));
}

export function caseCount() {
  return casesByKey.size;
}
