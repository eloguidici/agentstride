/**
 * Pure domain — no AgentStride imports.
 * Never grants production access automatically.
 */

export function assessProductionAccessRequest({
  customer,
  requestText,
}) {
  const text = String(requestText ?? "").toLowerCase();
  const asksProduction =
    text.includes("production") ||
    text.includes("prod access") ||
    text.includes("cannot access production");

  if (!asksProduction) {
    return {
      risk: "low",
      recommendation: "standard-support",
      requiresHumanApproval: false,
      notes: "No production-access request detected.",
    };
  }

  const restricted = customer?.productionAccess === "restricted";

  return {
    risk: "high",
    recommendation: "deny-auto-grant",
    requiresHumanApproval: true,
    notes: restricted
      ? "Customer production access is restricted. Human/security approval required before any grant."
      : "Production access requests require human/security approval. Do not auto-grant.",
  };
}
