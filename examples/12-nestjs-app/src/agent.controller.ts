import { Body, Controller, Post } from "@nestjs/common";
import { AgentStrideService } from "@agentstride/nestjs";

type RunBody = {
  input?: string;
  tenantId?: string;
};

@Controller("agent")
export class AgentController {
  constructor(private readonly agentStride: AgentStrideService) {}

  @Post("run")
  async run(@Body() body: RunBody) {
    const input = body.input?.trim();
    if (!input) {
      return { error: "body.input is required" };
    }

    const result = await this.agentStride.agent.run(input, {
      context: {
        tenantId: body.tenantId ?? "demo",
      },
    });

    return {
      id: result.id,
      status: result.status,
      text: result.text,
      steps: result.steps,
      durationMs: result.durationMs,
    };
  }
}
