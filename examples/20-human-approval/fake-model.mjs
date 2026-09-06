export function createFakeApprovalModel(scenario = "prod-access") {
  let call = 0;
  return {
    async generate() {
      call += 1;

      if (scenario === "unknown-customer") {
        if (call === 1) {
          return {
            toolCalls: [{ name: "findCustomer", input: { customerId: "NOPE" } }],
          };
        }
        return structured({
          decision: "customer-not-found",
          risk: "low",
          customerId: null,
          proposalId: null,
          summary: "Customer not found; no proposal created.",
          requiresHumanApproval: false,
          accessGranted: false,
        });
      }

      if (scenario === "info-only") {
        return structured({
          decision: "info-only",
          risk: "low",
          customerId: null,
          proposalId: null,
          summary: "General question; no sensitive action.",
          requiresHumanApproval: false,
          accessGranted: false,
        });
      }

      // prod-access (default)
      if (call === 1) {
        return {
          toolCalls: [{ name: "findCustomer", input: { customerId: "ACME" } }],
        };
      }
      if (call === 2) {
        return {
          toolCalls: [
            {
              name: "proposeProductionAccess",
              input: {
                customerId: "ACME",
                reason: "Customer cannot access production; needs temporary grant",
              },
            },
          ],
        };
      }
      return structured({
        decision: "needs-human-approval",
        risk: "high",
        customerId: "ACME",
        proposalId: "prop-1",
        summary:
          "Proposed production access for ACME. Waiting for external human approval. Access not granted.",
        requiresHumanApproval: true,
        accessGranted: false,
      });
    },
  };
}

function structured(output) {
  return { text: JSON.stringify(output), output };
}
