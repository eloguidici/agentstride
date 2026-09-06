/**
 * Pure domain — minimal role checks, not a policy engine.
 */

export const ACTIONS = {
  LOOKUP_CUSTOMER: "lookupCustomer",
  PROPOSE_PRODUCTION_ACCESS: "proposeProductionAccess",
  APPROVE_PRODUCTION_ACCESS: "approveProductionAccess",
  REJECT_PRODUCTION_ACCESS: "rejectProductionAccess",
};

export function canPerformAction(roles, action) {
  const normalized = Array.isArray(roles) ? roles.map(String) : [];

  if (action === ACTIONS.LOOKUP_CUSTOMER || action === ACTIONS.PROPOSE_PRODUCTION_ACCESS) {
    return (
      normalized.includes("support") ||
      normalized.includes("security") ||
      normalized.includes("admin")
    );
  }

  // Approvers are external humans/systems — not the proposing support agent alone.
  if (
    action === ACTIONS.APPROVE_PRODUCTION_ACCESS ||
    action === ACTIONS.REJECT_PRODUCTION_ACCESS
  ) {
    return normalized.includes("admin") || normalized.includes("security-approver");
  }

  return false;
}

export class PermissionDeniedError extends Error {
  constructor(action, roles) {
    super(
      `Permission denied for action "${action}" with roles [${(roles ?? []).join(", ")}]`,
    );
    this.name = "PermissionDeniedError";
    this.action = action;
    this.roles = roles;
  }
}

export function assertCanPerform(roles, action) {
  if (!canPerformAction(roles, action)) {
    throw new PermissionDeniedError(action, roles);
  }
}
