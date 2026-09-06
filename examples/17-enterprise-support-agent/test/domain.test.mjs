import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CustomerNotFoundError,
  findCustomerService,
} from "../domain/customer-service.mjs";
import {
  ACTIONS,
  PermissionDeniedError,
  assertCanPerform,
  canPerformAction,
} from "../domain/permissions.mjs";
import { assessProductionAccessRequest } from "../domain/security-service.mjs";
import {
  createSupportCaseService,
  resetSupportCaseService,
} from "../domain/support-case-service.mjs";

describe("domain services", () => {
  it("finds ACME and rejects unknown customers", () => {
    const customer = findCustomerService("ACME");
    assert.equal(customer.id, "ACME");
    assert.equal(customer.productionAccess, "restricted");
    assert.throws(() => findCustomerService("NOPE"), CustomerNotFoundError);
  });

  it("marks production access requests as high risk", () => {
    const customer = findCustomerService("ACME");
    const assessment = assessProductionAccessRequest({
      customer,
      requestText: "Customer cannot access production",
    });
    assert.equal(assessment.risk, "high");
    assert.equal(assessment.requiresHumanApproval, true);
  });

  it("creates support cases and can fail on demand", () => {
    resetSupportCaseService();
    const created = createSupportCaseService({
      customerId: "ACME",
      summary: "blocked",
      tenantId: "acme",
      requestId: "req-1",
      openedBy: "user-1",
    });
    assert.match(created.caseId, /^CASE-/);

    resetSupportCaseService({ failNextCreate: true });
    assert.throws(
      () =>
        createSupportCaseService({
          customerId: "ACME",
          summary: "blocked",
          tenantId: "acme",
          requestId: "req-1",
          openedBy: "user-1",
        }),
      /unavailable/,
    );
  });

  it("enforces simple role permissions", () => {
    assert.equal(canPerformAction(["viewer"], ACTIONS.CREATE_SUPPORT_CASE), false);
    assert.equal(canPerformAction(["support"], ACTIONS.CREATE_SUPPORT_CASE), true);
    assert.throws(
      () => assertCanPerform(["viewer"], ACTIONS.CREATE_SUPPORT_CASE),
      PermissionDeniedError,
    );
  });
});
