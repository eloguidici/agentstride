/**
 * Case-driven scripted model for deterministic evaluations.
 */

/**
 * @param {{ steps: object[] }} script
 */
export function createScriptedModel(script) {
  let call = 0;
  const steps = script?.steps ?? [];

  return {
    async generate(request) {
      if (request.signal?.aborted) {
        throw request.signal.reason instanceof Error
          ? request.signal.reason
          : new Error("model aborted");
      }

      if (call >= steps.length) {
        throw new Error(
          `scripted model exhausted: call=${call + 1}, steps=${steps.length}`,
        );
      }

      const step = steps[call];
      call += 1;

      if (typeof step.throw === "string") {
        throw new Error(step.throw);
      }

      if (Array.isArray(step.toolCalls)) {
        return { toolCalls: step.toolCalls };
      }

      if (step.output !== undefined) {
        return {
          text: JSON.stringify(step.output),
          output: step.output,
        };
      }

      if (typeof step.text === "string") {
        return { text: step.text };
      }

      throw new Error(`invalid script step at index ${call - 1}`);
    },
  };
}

/**
 * Default security specialist script used when a case delegates via askSecurity.
 */
export function defaultSecurityScript() {
  return {
    steps: [
      {
        toolCalls: [
          {
            name: "assessSecurity",
            input: {
              customerId: "ACME",
              requestText: "cannot access production",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            name: "searchKnowledge",
            input: { query: "production access policy" },
          },
        ],
      },
      {
        text: "Risk high. Production access requires human/security approval. Do not auto-grant.",
      },
    ],
  };
}
