import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { AgentStrideService } from "@agentstride/nestjs";

import { ApiKeyGuard } from "./api-key.guard.js";
import type { AgentRequestContext } from "./request-context.middleware.js";

type RunBody = {
  input?: string;
  tenantId?: string;
};

type AgentHttpRequest = {
  agentContext?: AgentRequestContext;
};

@Controller("agent")
@UseGuards(ApiKeyGuard)
export class AgentController {
  constructor(private readonly agentStride: AgentStrideService) {}

  @Post("run")
  @HttpCode(200)
  async run(@Body() body: RunBody, @Req() req: AgentHttpRequest) {
    const input = body.input?.trim();
    if (!input) {
      return { error: "body.input is required" };
    }

    const requestId = req.agentContext?.requestId ?? "unknown";
    const tenantId =
      body.tenantId?.trim() || req.agentContext?.tenantId || "demo";

    const result = await this.agentStride.agent.run(input, {
      context: {
        tenantId,
        requestId,
      },
    });

    return {
      id: result.id,
      status: result.status,
      text: result.text,
      steps: result.steps,
      durationMs: result.durationMs,
      requestId,
      tenantId,
    };
  }
}
