import { createAgent, defineTool, type Agent, type Model } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";
import { z } from "zod";

export const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({
    id: z.string(),
  }),
  execute({ id }, context) {
    return {
      id,
      name: "Ada Lovelace",
      plan: "enterprise",
      tenantId: context["tenantId"] ?? null,
      requestId: context["requestId"] ?? null,
    };
  },
});

export function createLiveModel(): Model {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY or OPENAI_API_KEY");
  }

  const usingOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  return createOpenAIModel({
    apiKey,
    model:
      process.env.OPENROUTER_MODEL ??
      process.env.OPENAI_MODEL ??
      "gpt-4o-mini",
    ...(usingOpenRouter
      ? {
          baseUrl: "https://openrouter.ai/api/v1",
          headers: {
            "HTTP-Referer": "https://github.com/eloguidici/agentstride",
            "X-Title": "AgentStride Nest example",
          },
        }
      : process.env.OPENAI_BASE_URL
        ? { baseUrl: process.env.OPENAI_BASE_URL }
        : {}),
  });
}

export function createAppAgent(model: Model = createLiveModel()): Agent {
  return createAgent({
    model,
    instructions:
      "You help with customer lookups inside a NestJS backend. Use findCustomer when needed. Be concise.",
    tools: { findCustomer },
    maxSteps: 4,
  });
}

export function createFakeAppAgent(): Agent {
  let call = 0;
  return createAppAgent({
    async generate() {
      call += 1;
      if (call === 1) {
        return {
          toolCalls: [{ name: "findCustomer", input: { id: "42" } }],
        };
      }
      return { text: "Customer 42 is Ada Lovelace on enterprise." };
    },
  });
}
