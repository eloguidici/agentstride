import { asAgentTool, createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

/**
 * Orchestrator + N specialists.
 * Proves local multi-agent delegation at more than 2 agents,
 * including optional parallel fan-out via Promise.all in a tool.
 */

const SPECIALISTS = ["security", "support", "compliance", "billing", "ops"];

function createSpecialist(name, reply) {
  return createAgent({
    model: {
      async generate({ prompt }) {
        return { text: `[${name}] ${reply} (re: ${String(prompt).slice(0, 48)})` };
      },
    },
    instructions: `You are the ${name} specialist.`,
  });
}

const agents = {
  security: createSpecialist("security", "Access denied until review completes."),
  support: createSpecialist("support", "Ticket drafted for the customer."),
  compliance: createSpecialist("compliance", "Policy requires dual approval."),
  billing: createSpecialist("billing", "No billing impact detected."),
  ops: createSpecialist("ops", "Change window is next Tuesday."),
};

const askTools = Object.fromEntries(
  SPECIALISTS.map((name) => [
    `ask${name[0].toUpperCase()}${name.slice(1)}`,
    asAgentTool(agents[name], {
      name: `ask${name[0].toUpperCase()}${name.slice(1)}`,
      description: `Ask the ${name} specialist`,
    }),
  ]),
);

const fanOut = defineTool({
  name: "fanOut",
  description: "Ask several specialists in parallel and return all answers",
  inputSchema: z.object({
    specialists: z
      .array(z.enum(["security", "support", "compliance", "billing", "ops"]))
      .min(1),
    request: z.string(),
  }),
  execute: async ({ specialists, request }, context) => {
    const results = await Promise.all(
      specialists.map(async (name) => {
        const result = await agents[name].run(request, { context });
        return { specialist: name, text: result.text };
      }),
    );
    return results;
  },
});

let call = 0;
const orchestratorModel = {
  async generate() {
    call += 1;
    if (call === 1) {
      return {
        toolCalls: [
          {
            name: "fanOut",
            input: {
              specialists: ["security", "compliance", "ops"],
              request: "Vendor wants production DB access before security review.",
            },
          },
        ],
      };
    }
    if (call === 2) {
      return {
        toolCalls: [
          {
            name: "askSupport",
            input: { request: "Summarize next step for the customer." },
          },
        ],
      };
    }
    return {
      text: "Orchestrator: block access until security+compliance clear; ops window Tue; support will message the vendor.",
    };
  },
};

const orchestrator = createAgent({
  model: orchestratorModel,
  instructions:
    "You are the orchestrator. Delegate to specialists via ask* tools or fanOut. Then summarize briefly.",
  tools: {
    ...askTools,
    fanOut,
  },
  maxSteps: 6,
});

const result = await orchestrator.run(
  "A vendor wants production database access before their security review is finished.",
);

console.log("text:", result.text);
console.log("steps:", result.steps);
console.log("status:", result.status);
console.log("specialists:", SPECIALISTS.length);
