/**
 * Pure domain — normalize heterogeneous change requests into one shape.
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
 *   team: string,
 *   externalId: string,
 *   environment: string,
 *   title: string,
 *   fingerprint: string,
 *   hints: { isRoutine: boolean, isElevated: boolean, isEmergency: boolean }
 * }}
 */
export function normalizeChange(raw) {
  if (raw == null) throw new NormalizeError("empty change");

  if (typeof raw === "string") return normalizeWiredesk(raw);

  if (typeof raw === "object" && raw.system === "shipyard") {
    return normalizeShipyard(raw);
  }

  if (typeof raw === "object" && raw.portal === "ledgerops") {
    return normalizeLedgerops(raw);
  }

  throw new NormalizeError("unknown change shape");
}

function normalizeShipyard(raw) {
  const title = String(raw.title ?? "");
  const risk = String(raw.risk ?? "low").toLowerCase();
  const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : [];
  const externalId = String(raw.changeId ?? "");
  const environment = String(raw.env ?? "unknown");
  const hints = classifyHints({
    risk,
    title,
    tags,
    window: String(raw.window ?? ""),
  });
  return {
    source: "shipyard",
    team: "platform",
    externalId,
    environment,
    title,
    fingerprint: fingerprintOf("shipyard", externalId, environment, title),
    hints,
  };
}

function normalizeWiredesk(text) {
  const change = String(text).match(/Change:\s*(\S+)/i)?.[1];
  const risk = String(text).match(/Risk:\s*(\S+)/i)?.[1] ?? "low";
  const environment = String(text).match(/Env:\s*(\S+)/i)?.[1] ?? "unknown";
  const subject = String(text).match(/Subject:\s*(.+)/i)?.[1]?.trim() ?? "";
  if (!change) throw new NormalizeError(`unparseable wiredesk change: ${text}`);
  const hints = classifyHints({
    risk: risk.toLowerCase(),
    title: subject,
    tags: /\bemergency\b/i.test(text) ? ["emergency"] : [],
    window: /\bimmediately?\b|execute now/i.test(text) ? "immediate" : "",
  });
  return {
    source: "wiredesk",
    team: "netops",
    externalId: change,
    environment: environment.toLowerCase(),
    title: subject,
    fingerprint: fingerprintOf("wiredesk", change, environment, subject),
    hints,
  };
}

function normalizeLedgerops(raw) {
  const payload = raw.payload ?? {};
  const title = String(payload.summary ?? "");
  const level = String(payload.level ?? "routine").toLowerCase();
  const externalId = String(payload.id ?? "");
  const environment =
    level === "routine" ? "nonprod" : "production";
  const hints = classifyHints({
    risk:
      level === "emergency" ? "high" : level === "elevated" ? "medium" : "low",
    title,
    tags: level === "emergency" ? ["emergency"] : [],
    window: level === "emergency" ? "immediate" : "",
  });
  return {
    source: "ledgerops",
    team: "payments",
    externalId,
    environment,
    title,
    fingerprint: fingerprintOf("ledgerops", externalId, environment, title),
    hints,
  };
}

function classifyHints({ risk, title, tags, window }) {
  const blob = `${risk} ${title} ${tags.join(" ")} ${window}`.toLowerCase();
  const isEmergency =
    risk === "high" ||
    tags.includes("emergency") ||
    /\bhotfix\b/.test(blob) ||
    /\bemergency\b/.test(blob) ||
    window === "immediate";
  const isElevated =
    !isEmergency &&
    (risk === "medium" ||
      /\bcanary\b/.test(blob) ||
      /\bmigrate\b/.test(blob) ||
      /\bmaintenance\b/.test(blob) ||
      /\bproduction\b/.test(blob));
  const isRoutine = !isEmergency && !isElevated;
  return { isRoutine, isElevated, isEmergency };
}

function fingerprintOf(source, externalId, environment, title) {
  const base = externalId || `${environment}|${title}`;
  return `${source}:${base}`.toLowerCase();
}

/**
 * Domain policy — not LLM.
 */
export function suggestChangeAction(normalized) {
  if (normalized.hints.isEmergency) {
    return {
      category: "emergency",
      severity: "high",
      recommendedAction: "proposeExecute",
      requiresHumanApproval: true,
      reason: "Emergency/high-risk change must not auto-execute.",
    };
  }
  if (normalized.hints.isElevated) {
    return {
      category: "elevated",
      severity: "medium",
      recommendedAction: "proposeExecute",
      requiresHumanApproval: true,
      reason: "Elevated production change requires approval before execute.",
    };
  }
  return {
    category: "routine",
    severity: "low",
    recommendedAction: "record",
    requiresHumanApproval: false,
    reason: "Routine/low-risk change — record only.",
  };
}
