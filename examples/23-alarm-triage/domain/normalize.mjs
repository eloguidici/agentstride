/**
 * Pure domain — normalize heterogeneous raw alarms into one shape.
 */

export class NormalizeError extends Error {
  constructor(message) {
    super(message);
    this.name = "NormalizeError";
  }
}

/**
 * @returns {{
 *   source: string,
 *   externalId: string,
 *   hostOrComponent: string,
 *   rawLevel: string,
 *   message: string,
 *   fingerprint: string,
 *   hints: { isPing: boolean, isWarning: boolean, isError: boolean }
 * }}
 */
export function normalizeAlarm(raw) {
  if (raw == null) {
    throw new NormalizeError("empty alarm");
  }

  if (typeof raw === "string") {
    return normalizeWirewatch(raw);
  }

  if (typeof raw === "object" && raw.source === "pulsebeat") {
    return normalizePulsebeat(raw);
  }

  if (typeof raw === "object" && raw.origin === "ledgerflare") {
    return normalizeLedgerflare(raw);
  }

  throw new NormalizeError("unknown alarm shape");
}

function normalizePulsebeat(raw) {
  const message = String(raw.message ?? "");
  const rawLevel = String(raw.severity ?? "info").toLowerCase();
  const externalId = String(raw.eventId ?? "");
  const hostOrComponent = String(raw.host ?? "unknown");
  const hints = classifyHints(message, rawLevel);
  const fingerprint = fingerprintOf("pulsebeat", externalId, hostOrComponent, message);
  return {
    source: "pulsebeat",
    team: "platform",
    externalId,
    hostOrComponent,
    rawLevel,
    message,
    fingerprint,
    hints,
  };
}

function normalizeWirewatch(line) {
  const match = String(line).match(
    /^<(\w+)>\s+(\S+)\s+(.+?)\s+id=(\S+)\s*$/i,
  );
  if (!match) {
    throw new NormalizeError(`unparseable wirewatch line: ${line}`);
  }
  const rawLevel = match[1].toLowerCase();
  const hostOrComponent = match[2];
  const message = match[3].trim();
  const externalId = match[4];
  const hints = classifyHints(message, rawLevel);
  return {
    source: "wirewatch",
    team: "netops",
    externalId,
    hostOrComponent,
    rawLevel,
    message,
    fingerprint: fingerprintOf("wirewatch", externalId, hostOrComponent, message),
    hints,
  };
}

function normalizeLedgerflare(raw) {
  const env = raw.envelope ?? {};
  const message = String(env.text ?? "");
  const rawLevel = String(env.level ?? "INFO").toLowerCase();
  const externalId = String(env.id ?? "");
  const hostOrComponent = String(env.component ?? "unknown");
  const hints = classifyHints(message, rawLevel);
  return {
    source: "ledgerflare",
    team: "payments",
    externalId,
    hostOrComponent,
    rawLevel,
    message,
    fingerprint: fingerprintOf("ledgerflare", externalId, hostOrComponent, message),
    hints,
  };
}

function classifyHints(message, rawLevel) {
  const text = `${message} ${rawLevel}`.toLowerCase();
  const isPing =
    /\bping\b/.test(text) ||
    /\bheartbeat\b/.test(text) ||
    /\bhealth ping\b/.test(text);
  const isError =
    /\bcrit(ical)?\b/.test(text) ||
    /\berror\b/.test(text) ||
    /\bcrash\b/.test(text) ||
    /\bfailed\b/.test(text) ||
    /\bdown\b/.test(text);
  const isWarning =
    !isError &&
    (/\bwarn/.test(text) ||
      /\blatency\b/.test(text) ||
      /\bflapping\b/.test(text) ||
      /\babove\b/.test(text));
  return { isPing, isWarning, isError };
}

function fingerprintOf(source, externalId, hostOrComponent, message) {
  // Stable business key for idempotency (not a crypto hash).
  const base = externalId || `${hostOrComponent}|${message}`;
  return `${source}:${base}`.toLowerCase();
}

/**
 * Deterministic category suggestion from normalized hints (domain policy, not LLM).
 */
export function suggestCategory(normalized) {
  if (normalized.hints.isPing && !normalized.hints.isError) {
    return {
      category: "noise",
      severity: "low",
      recommendedAction: "drop",
      requiresHumanApproval: false,
      reason: "Ping/heartbeat style signal without error markers.",
    };
  }
  if (normalized.hints.isError) {
    return {
      category: "incident",
      severity: "high",
      recommendedAction: "page",
      requiresHumanApproval: true,
      reason: "Error/critical markers require incident handling.",
    };
  }
  if (normalized.hints.isWarning) {
    return {
      category: "warning",
      severity: "medium",
      recommendedAction: "ticket",
      requiresHumanApproval: false,
      reason: "Warning-level degradation; ticket without paging.",
    };
  }
  return {
    category: "warning",
    severity: "low",
    recommendedAction: "ticket",
    requiresHumanApproval: false,
    reason: "Unrecognized signal; default to ticket for human review.",
  };
}
