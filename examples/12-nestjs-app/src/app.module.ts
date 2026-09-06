import { Module } from "@nestjs/common";
import { createAgent, defineTool, type Agent } from "@agentstride/core";
import {
  AGENTSTRIDE_AGENT,
  AgentStrideService,
} from "@agentstride/nestjs";
import { createOpenAIModel } from "@agentstride/openai";
import { z } from "zod";

import { AgentController } from "./agent.controller.js";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({
    id: z.string(),
  }),
  execute({ id }) {
    return { id, name: "Ada Lovelace", plan: "enterprise" };
  },
});

function createAppAgent(): Agent {
  const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY or OPENAI_API_KEY");
  }

  const usingOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
  const model = createOpenAIModel({
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

  return createAgent({
    model,
    instructions:
      "You help with customer lookups inside a NestJS backend. Use findCustomer when needed. Be concise.",
    tools: { findCustomer },
    maxSteps: 4,
  });
}

@Module({
  controllers: [AgentController],
  providers: [
    {
      provide: AGENTSTRIDE_AGENT,
      useFactory: () => createAppAgent(),
    },
    {
      provide: AgentStrideService,
      useFactory: (agent: Agent) => new AgentStrideService(agent),
      inject: [AGENTSTRIDE_AGENT],
    },
  ],
})
export class AppModule {}
