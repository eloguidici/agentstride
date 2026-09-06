import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { ApiKeyGuard } from "./api-key.guard.js";
import type { SupportRequestContext } from "./request-context.middleware.js";
import { EnterpriseSupportService } from "./support.service.js";

type RunBody = {
  input?: string;
  roles?: string[];
};

type SupportHttpRequest = {
  supportContext?: SupportRequestContext;
  on?: (event: string, listener: () => void) => void;
  aborted?: boolean;
};

@Controller("support")
@UseGuards(ApiKeyGuard)
export class SupportController {
  constructor(private readonly support: EnterpriseSupportService) {}

  @Post("run")
  @HttpCode(200)
  async run(@Body() body: RunBody, @Req() req: SupportHttpRequest) {
    const input = body.input?.trim();
    if (!input) {
      return { error: "body.input is required" };
    }

    const base = req.supportContext;
    const requestId = base?.requestId ?? "unknown";
    const tenantId = base?.tenantId ?? "demo";
    const userId = base?.userId ?? "anonymous";
    const roles =
      Array.isArray(body.roles) && body.roles.length > 0
        ? body.roles.map(String)
        : (base?.roles ?? ["support"]);

    const controller = new AbortController();
    const onClose = () => {
      if (!controller.signal.aborted) {
        controller.abort(new Error("HTTP request closed"));
      }
    };
    req.on?.("close", onClose);

    try {
      const result = await this.support.run(input, {
        context: {
          tenantId,
          userId,
          requestId,
          roles,
        },
        signal: controller.signal,
      });

      return {
        id: result.id,
        status: result.status,
        text: result.text,
        output: result.output,
        steps: result.steps,
        durationMs: result.durationMs,
        requestId,
        tenantId,
        userId,
      };
    } catch (error) {
      const err = error as Error & {
        agentRun?: {
          id: string;
          status: string;
          steps: number;
          durationMs: number;
          text?: string;
        };
      };
      return {
        error: err.message ?? String(error),
        requestId,
        tenantId,
        userId,
        ...(err.agentRun
          ? {
              agentRun: {
                id: err.agentRun.id,
                status: err.agentRun.status,
                steps: err.agentRun.steps,
                durationMs: err.agentRun.durationMs,
                text: err.agentRun.text,
              },
            }
          : {}),
      };
    } finally {
      // best-effort; Node IncomingMessage may not expose off()
      try {
        (req as { off?: (e: string, l: () => void) => void }).off?.(
          "close",
          onClose,
        );
      } catch {
        // ignore
      }
    }
  }
}
