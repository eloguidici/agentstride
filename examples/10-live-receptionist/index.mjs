import { asAgentTool, createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import { createLiveModel } from "../_shared/live-model.mjs";

const model = createLiveModel();

const securityAgent = createAgent({
  model,
  instructions:
    "You are the security specialist. Review access and risk briefly. No tools.",
});

const supportAgent = createAgent({
  model,
  instructions:
    "You are the support specialist. Draft a short next step for the customer. No tools.",
});

const route = defineTool({
  name: "route",
  description: "Delegate a request to security or support",
  inputSchema: z.object({
    specialist: z.enum(["security", "support"]),
    request: z.string(),
  }),
  execute: async ({ specialist, request }, context) => {
    const specialistAgent =
      specialist === "security" ? securityAgent : supportAgent;
    console.log(`delegating to ${specialist}...`);
    const result = await specialistAgent.run(request, { context });
    return result.text;
  },
});

const receptionist = createAgent({
  model,
  instructions:
    "You are ReceptionistAgent. For security/access/risk questions use route with specialist=security. For customer help use route with specialist=support. Then summarize the specialist answer briefly.",
  tools: {
    route,
    askSupport: asAgentTool(supportAgent, {
      name: "askSupport",
      description: "Ask the support specialist directly",
    }),
  },
  maxSteps: 4,
  onEvent(event) {
    if (event.type === "tool:start") {
      console.log(event.type, event.toolName);
    }
  },
});

const result = await receptionist.run(
  "A vendor wants production database access before their security review is finished. What should we do?",
);

console.log("text:", result.text);
console.log("steps:", result.steps);
console.log("status:", result.status);
