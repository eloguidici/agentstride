/**
 * Pure domain — no AgentStride imports.
 * Mutable customer production-access state for approval demos.
 */

export class CustomerNotFoundError extends Error {
  constructor(customerId) {
    super(`Customer not found: ${customerId}`);
    this.name = "CustomerNotFoundError";
    this.customerId = customerId;
  }
}

/** @type {Map<string, { id: string, name: string, productionAccess: string }>} */
let customers = new Map();

export function resetCustomerStore() {
  customers = new Map([
    [
      "ACME",
      {
        id: "ACME",
        name: "Acme Corp",
        productionAccess: "restricted",
      },
    ],
  ]);
}

resetCustomerStore();

export function findCustomerService(customerId) {
  const customer = customers.get(String(customerId).trim());
  if (!customer) {
    throw new CustomerNotFoundError(customerId);
  }
  return { ...customer };
}

/**
 * Side effect: grant production access. Domain-only; never called by the agent.
 */
export function grantProductionAccessService({ customerId, grantedBy, proposalId }) {
  const key = String(customerId).trim();
  const customer = customers.get(key);
  if (!customer) {
    throw new CustomerNotFoundError(customerId);
  }
  customer.productionAccess = "granted";
  return {
    customerId: customer.id,
    productionAccess: customer.productionAccess,
    grantedBy,
    proposalId,
  };
}
