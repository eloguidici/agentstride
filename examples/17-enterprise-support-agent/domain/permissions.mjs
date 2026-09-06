/**
 * Pure domain — minimal role checks, not a policy engine.
 */

export const ACTIONS = {
  CREATE_SUPPORT_CASE: "createSupportCase",
  LOOKUP_CUSTOMER: "lookupCustomer",
  ASSESS_SECURITY: "assessSecurity",
};

export function canPerformAction(roles, action) {
  const normalized = Array.isArray(roles) ? roles.map(String) : [];

  if (action === ACTIONS.LOOKUP_CUSTOMER || action === ACTIONS.ASSESS_SECURITY) {
    return (
      normalized.includes("support") ||
      normalized.includes("security") ||
      normalized.includes("admin")
    );
  }

  if (action === ACTIONS.CREATE_SUPPORT_CASE) {
    return normalized.includes("support") || normalized.includes("admin");
  }

  return false;
}

export class PermissionDeniedError extends Error {
  constructor(action, roles) {
    super(`Permission denied for action "${action}" with roles [${(roles ?? []).join(", ")}]`);
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
