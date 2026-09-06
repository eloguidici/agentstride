#!/usr/bin/env node
import { createCaseAgent } from "./agents/case-agent.mjs";
import {
  caseCount,
  listCases,
  resetSupportCaseStore,
} from "./domain/support-case-service.mjs";

resetSupportCaseStore();

let call = 0;
const model = {
  async generate(request) {
    call += 1;
    if (call === 1 || call === 2) {
      // Model "retries" the same tool call (duplicate in one run).
      return {
        toolCalls: [
          {
            name: "createSupportCase",
            input: {
              customerId: "ACME",
              summary: "Cannot access production",
            },
          },
        ],
      };
    }
    const last = request.messages.filter((m) => m.role === "tool").at(-1);
    return { text: `case=${last?.output?.caseId} replayed=${last?.output?.replayed}` };
  },
};

const { agent } = createCaseAgent(model);
const result = await agent.run("Open a case for ACME", {
  context: {
    tenantId: "acme",
    requestId: "req-dup-1",
    userId: "op-1",
  },
});

console.log(result.text);
console.log("cases stored:", caseCount(), listCases());
