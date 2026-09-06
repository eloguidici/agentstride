import { asAgentTool, createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const securityAgent = createAgent({
  model: {
    async generate() {
      return { text: "Security review: no critical findings." };
    },
  },
  instructions: "You are the security specialist.",
});

const supportAgent = createAgent({
  model: {
    async generate() {
      return { text: "Support: ticket drafted for the customer." };
    },
  },
  instructions: "You are the support specialist.",
});

const route = defineTool({
  name: "route",
  description: "Choose a specialist",
  inputSchema: z.object({
    specialist: z.enum(["security", "support"]),
    request: z.string(),
  }),
  execute: async ({ specialist, request }, context) => {
    const specialistAgent =
      specialist === "security" ? securityAgent : supportAgent;
    const result = await specialistAgent.run(request, { context });
    return result.text;
  },
});

let call = 0;
const receptionistModel = {
  async generate() {
    call += 1;
    if (call === 1) {
      return {
        toolCalls: [
          {
            name: "route",
            input: {
              specialist: "security",
              request: "Review this access change",
            },
          },
        ],
      };
    }
    return { text: "Routed to security specialist." };
  },
};

const receptionist = createAgent({
  model: receptionistModel,
  instructions: "You are ReceptionistAgent. Delegate to specialists.",
  tools: {
    route,
    askSupport: asAgentTool(supportAgent, {
      name: "askSupport",
      description: "Ask the support specialist",
    }),
  },
});

const result = await receptionist.run("Need a security review");
console.log(result.text);
