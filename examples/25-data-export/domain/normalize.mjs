export class NormalizeError extends Error {
  constructor(message) {
    super(message);
    this.name = "NormalizeError";
  }
}

export function normalizeExportRequest(raw) {
  if (raw == null) throw new NormalizeError("empty request");
  if (typeof raw === "string") return normalizeMailroom(raw);
  if (typeof raw === "object" && raw.system === "idvault") {
    return normalizeIdvault(raw);
  }
  if (typeof raw === "object" && raw.portal === "ledgerflare-pii") {
    return normalizeLedgerflarePii(raw);
  }
  throw new NormalizeError("unknown export request shape");
}

function normalizeIdvault(raw) {
  const subjectEmail = String(raw.subjectEmail ?? "").toLowerCase();
  const externalId = String(raw.requestId ?? "");
  const type = String(raw.type ?? "ack-only").toLowerCase();
  const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : [];
  const notes = String(raw.notes ?? "");
  const hints = classifyHints({ type, tags, notes });
  return {
    source: "idvault",
    team: "identity",
    externalId,
    subjectEmail,
    title: notes || type,
    fingerprint: fingerprintOf("idvault", externalId, subjectEmail),
    hints,
  };
}

function normalizeMailroom(text) {
  const externalId = String(text).match(/Ref:\s*(\S+)/i)?.[1];
  const subjectEmail =
    String(text).match(/From:\s*(\S+)/i)?.[1]?.toLowerCase() ??
    String(text).match(/for\s+(\S+@\S+)/i)?.[1]?.toLowerCase() ??
    "";
  const intent = String(text).match(/Intent:\s*(\S+)/i)?.[1] ?? "acknowledge";
  const subject = String(text).match(/Subject:\s*(.+)/i)?.[1]?.trim() ?? "";
  if (!externalId) throw new NormalizeError(`unparseable mailroom: ${text}`);
  const tags = /\bregulator\b/i.test(text) ? ["regulator"] : [];
  const hints = classifyHints({
    type: intent.toLowerCase() === "export" ? "export" : "ack-only",
    tags,
    notes: subject,
  });
  return {
    source: "mailroom",
    team: "privacy",
    externalId,
    subjectEmail,
    title: subject,
    fingerprint: fingerprintOf("mailroom", externalId, subjectEmail),
    hints,
  };
}

function normalizeLedgerflarePii(raw) {
  const env = raw.envelope ?? {};
  const externalId = String(env.id ?? "");
  const subjectEmail = String(env.email ?? "").toLowerCase();
  const kind = String(env.kind ?? "lookup").toLowerCase();
  const flags = Array.isArray(env.flags) ? env.flags.map(String) : [];
  const hints = classifyHints({
    type: kind === "export" ? "export" : "ack-only",
    tags: flags,
    notes: String(env.customerRef ?? ""),
  });
  return {
    source: "ledgerflare-pii",
    team: "payments",
    externalId,
    subjectEmail,
    title: `customer ${env.customerRef ?? "unknown"}`,
    fingerprint: fingerprintOf("ledgerflare-pii", externalId, subjectEmail),
    hints,
  };
}

function classifyHints({ type, tags, notes }) {
  const blob = `${type} ${tags.join(" ")} ${notes}`.toLowerCase();
  const isRegulator = tags.includes("regulator") || /\bregulator\b/.test(blob);
  const wantsExport = type === "export" || /\bexport\b/.test(blob);
  const isAckOnly = !wantsExport;
  return { isAckOnly, wantsExport, isRegulator };
}

function fingerprintOf(source, externalId, subjectEmail) {
  const base = externalId || subjectEmail;
  return `${source}:${base}`.toLowerCase();
}

export function suggestExportAction(normalized) {
  if (normalized.hints.wantsExport) {
    return {
      category: normalized.hints.isRegulator ? "regulator-export" : "export",
      severity: normalized.hints.isRegulator ? "high" : "medium",
      recommendedAction: "proposeExport",
      requiresHumanApproval: true,
      reason: "Data export requires privacy-officer approval.",
    };
  }
  return {
    category: "acknowledge",
    severity: "low",
    recommendedAction: "acknowledge",
    requiresHumanApproval: false,
    reason: "Ack-only request; no package leave the boundary.",
  };
}
