import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { StructuredOutputValidationError } from "@agentstride/core";

import {
  createReceptionistAgent,
  runReceptionist,
} from "../agents/receptionist.mjs";
import {
  createFakeEnterpriseModel,
  createFakeSecurityModel,
} from "../fake-model.mjs";
import { resetSupportCaseService } from "../domain/support-case-service.mjs";
import { DEMO_CONTEXT } from "../trace.mjs";

describe("receptionist behavior (fake model)", () => {
  it("happy path returns structured ticket-created result", async () => {
    resetSupportCaseService();
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("happy"),
      { securityModel: createFakeSecurityModel() },
    );

    const result = await runReceptionist(
      receptionist,
      "Customer ACME cannot access production. Check account and open a case.",
      { context: DEMO_CONTEXT },
    );

    assert.equal(result.status, "completed");
    assert.equal(result.output.decision, "ticket-created");
    assert.equal(result.output.risk, "high");
    assert.equal(result.output.customerId, "ACME");
    assert.equal(result.output.requiresHumanApproval, true);
    assert.ok(result.output.caseId);
  });

  it("customer-not-found path", async () => {
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("customer-missing"),
      { securityModel: createFakeSecurityModel() },
    );

    const result = await runReceptionist(receptionist, "Find NOPE", {
      context: DEMO_CONTEXT,
    });
    assert.equal(result.output.decision, "customer-not-found");
  });

  it("rejects invalid structured output", async () => {
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("invalid-output"),
      { securityModel: createFakeSecurityModel() },
    );

    await assert.rejects(
      () =>
        runReceptionist(receptionist, "anything", {
          context: DEMO_CONTEXT,
        }),
      (error) => error instanceof StructuredOutputValidationError,
    );
  });

  it("permission-denied when createSupportCase is attempted without role", async () => {
    const receptionist = createReceptionistAgent(
      createFakeEnterpriseModel("permission-denied"),
      { securityModel: createFakeSecurityModel() },
    );

    await assert.rejects(
      () =>
        runReceptionist(receptionist, "open a case", {
          context: { ...DEMO_CONTEXT, roles: ["viewer"] },
        }),
      /Permission denied/,
    );
  });
});
