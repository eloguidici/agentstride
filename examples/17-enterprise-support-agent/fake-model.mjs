/**
 * Scripted fake model for offline / CI runs of the enterprise support slice.
 */

export function createFakeEnterpriseModel(scenario = "happy") {
  let call = 0;

  return {
    async generate(request) {
      if (request.signal?.aborted) {
        throw request.signal.reason instanceof Error
          ? request.signal.reason
          : new Error("model aborted");
      }

      call += 1;

      if (scenario === "model-fail") {
        throw new Error("upstream model unavailable");
      }

      if (scenario === "cancel-probe") {
        if (call === 1) {
          return {
            toolCalls: [{ name: "slowAuditPing", input: { delayMs: 500 } }],
          };
        }
        return {
          text: JSON.stringify({
            decision: "info-only",
            risk: "low",
            customerId: null,
            caseId: null,
            summary: "Cancelled path should not finish.",
            requiresHumanApproval: false,
          }),
          output: {
            decision: "info-only",
            risk: "low",
            customerId: null,
            caseId: null,
            summary: "Cancelled path should not finish.",
            requiresHumanApproval: false,
          },
        };
      }

      if (scenario === "customer-missing") {
        if (call === 1) {
          return {
            toolCalls: [{ name: "findCustomer", input: { customerId: "NOPE" } }],
          };
        }
        return structured({
          decision: "customer-not-found",
          risk: "low",
          customerId: null,
          caseId: null,
          summary: "Customer NOPE was not found.",
          requiresHumanApproval: false,
        });
      }

      if (scenario === "permission-denied") {
        if (call === 1) {
          return {
            toolCalls: [
              {
                name: "createSupportCase",
                input: { customerId: "ACME", summary: "Need prod access" },
              },
            ],
          };
        }
        return structured({
          decision: "permission-denied",
          risk: "medium",
          customerId: "ACME",
          caseId: null,
          summary: "Operator lacks support role to open a case.",
          requiresHumanApproval: true,
        });
      }

      if (scenario === "case-fail") {
        if (call === 1) {
          return {
            toolCalls: [{ name: "findCustomer", input: { customerId: "ACME" } }],
          };
        }
        if (call === 2) {
          return {
            toolCalls: [
              {
                name: "askSecurity",
                input: {
                  request:
                    "Customer ACME cannot access production. Assess risk and policy.",
                },
              },
            ],
          };
        }
        if (call === 3) {
          return {
            toolCalls: [
              {
                name: "createSupportCase",
                input: {
                  customerId: "ACME",
                  summary: "Production access blocked; needs security approval",
                },
              },
            ],
          };
        }
        return structured({
          decision: "needs-human-approval",
          risk: "high",
          customerId: "ACME",
          caseId: null,
          summary: "Case backend failed; still requires human approval for prod access.",
          requiresHumanApproval: true,
        });
      }

      if (scenario === "invalid-output") {
        return {
          text: '{"decision":"nope"}',
          output: { decision: "nope" },
        };
      }

      // happy path (default)
      if (call === 1) {
        return {
          toolCalls: [{ name: "findCustomer", input: { customerId: "ACME" } }],
        };
      }
      if (call === 2) {
        return {
          toolCalls: [
            {
              name: "askSecurity",
              input: {
                request:
                  "Customer ACME cannot access production. Check restrictions and policy.",
              },
            },
          ],
        };
      }
      if (call === 3) {
        return {
          toolCalls: [
            {
              name: "createSupportCase",
              input: {
                customerId: "ACME",
                summary:
                  "Cannot access production; security risk high; human approval required",
              },
            },
          ],
        };
      }

      return structured({
        decision: "ticket-created",
        risk: "high",
        customerId: "ACME",
        caseId: "CASE-1001",
        summary:
          "Opened support case. Production access requires human/security approval; no automatic grant.",
        requiresHumanApproval: true,
      });
    },
  };
}

/**
 * Fake model for the security specialist (used when receptionist asks askSecurity).
 */
export function createFakeSecurityModel() {
  let call = 0;
  return {
    async generate() {
      call += 1;
      if (call === 1) {
        return {
          toolCalls: [
            {
              name: "assessSecurity",
              input: {
                customerId: "ACME",
                requestText: "cannot access production",
              },
            },
          ],
        };
      }
      if (call === 2) {
        return {
          toolCalls: [
            {
              name: "searchKnowledge",
              input: { query: "production access policy" },
            },
          ],
        };
      }
      return {
        text: "Risk high. Production access requires human/security approval. Do not auto-grant. Policy: automatic grants forbidden.",
      };
    },
  };
}

function structured(output) {
  return {
    text: JSON.stringify(output),
    output,
  };
}
