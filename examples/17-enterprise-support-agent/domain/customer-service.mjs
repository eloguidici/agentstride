/**
 * Pure domain — no AgentStride imports.
 */

export class CustomerNotFoundError extends Error {
  constructor(customerId) {
    super(`Customer not found: ${customerId}`);
    this.name = "CustomerNotFoundError";
    this.customerId = customerId;
  }
}

const CUSTOMERS = new Map([
  [
    "ACME",
    {
      id: "ACME",
      name: "Acme Corp",
      plan: "enterprise",
      status: "active",
      productionAccess: "restricted",
    },
  ],
  [
    "acme",
    {
      id: "ACME",
      name: "Acme Corp",
      plan: "enterprise",
      status: "active",
      productionAccess: "restricted",
    },
  ],
]);

export function findCustomerService(customerId) {
  const customer = CUSTOMERS.get(String(customerId).trim());
  if (!customer) {
    throw new CustomerNotFoundError(customerId);
  }
  return { ...customer };
}
