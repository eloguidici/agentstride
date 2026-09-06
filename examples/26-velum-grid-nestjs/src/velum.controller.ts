import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { ApiKeyGuard } from "./api-key.guard.js";
import type { VelumRequestContext } from "./request-context.middleware.js";
import { VelumGridService } from "./velum.service.js";

type ScenarioBody = {
  input?: string;
  scenario?: string;
};

type VelumHttpRequest = {
  velumContext?: VelumRequestContext;
  on?: (event: string, listener: () => void) => void;
};

function mapDomainError(error: unknown): never {
  const name = error instanceof Error ? error.name : "Error";
  const message = error instanceof Error ? error.message : String(error);
  const status =
    name === "PageProposalNotFoundError" ||
    name === "ExecuteProposalNotFoundError"
      ? 404
      : name === "PermissionDeniedError"
        ? 403
        : name === "ProposalConflictError"
          ? 409
          : 500;
  throw new HttpException({ error: message, name }, status);
}

function wireAbort(req: VelumHttpRequest) {
  const controller = new AbortController();
  const onClose = () => {
    if (!controller.signal.aborted) {
      controller.abort(new Error("HTTP request closed"));
    }
  };
  req.on?.("close", onClose);
  return {
    signal: controller.signal,
    cleanup() {
      try {
        (req as { off?: (e: string, l: () => void) => void }).off?.(
          "close",
          onClose,
        );
      } catch {
        // ignore
      }
    },
  };
}

@Controller()
@UseGuards(ApiKeyGuard)
export class VelumController {
  constructor(private readonly velum: VelumGridService) {}

  @Post("alarms/triage")
  @HttpCode(200)
  async triage(@Body() body: ScenarioBody, @Req() req: VelumHttpRequest) {
    const ctx = req.velumContext;
    const input = body.input?.trim() || "Triage Velum Grid alarm";
    const scenario = body.scenario?.trim() || "pulsebeat-crash";
    const abort = wireAbort(req);
    try {
      const result = await this.velum.triage(input, scenario, {
        context: {
          tenantId: ctx?.tenantId ?? "velum-grid",
          userId: ctx?.userId ?? "triage-bot",
          requestId: ctx?.requestId ?? "unknown",
          roles: ctx?.roles ?? ["sre"],
        },
        signal: abort.signal,
      });
      return {
        output: result.output,
        runId: result.id,
        status: result.status,
        requestId: ctx?.requestId,
        tenantId: ctx?.tenantId,
        userId: ctx?.userId,
      };
    } finally {
      abort.cleanup();
    }
  }

  @Post("pages/:id/approve")
  @HttpCode(200)
  approvePage(@Param("id") id: string, @Req() req: VelumHttpRequest) {
    const ctx = req.velumContext;
    try {
      return this.velum.approvePage(
        decodeURIComponent(id),
        ctx?.userId ?? "unknown",
        ctx?.roles ?? [],
      );
    } catch (error) {
      mapDomainError(error);
    }
  }

  @Post("pages/:id/reject")
  @HttpCode(200)
  rejectPage(@Param("id") id: string, @Req() req: VelumHttpRequest) {
    const ctx = req.velumContext;
    try {
      return this.velum.rejectPage(
        decodeURIComponent(id),
        ctx?.userId ?? "unknown",
        ctx?.roles ?? [],
      );
    } catch (error) {
      mapDomainError(error);
    }
  }

  @Post("changes/gate")
  @HttpCode(200)
  async gate(@Body() body: ScenarioBody, @Req() req: VelumHttpRequest) {
    const ctx = req.velumContext;
    const input = body.input?.trim() || "Gate Velum Grid change";
    const scenario = body.scenario?.trim() || "shipyard-hotfix";
    const abort = wireAbort(req);
    try {
      const result = await this.velum.changeGate(input, scenario, {
        context: {
          tenantId: ctx?.tenantId ?? "velum-grid",
          userId: ctx?.userId ?? "change-bot",
          requestId: ctx?.requestId ?? "unknown",
          roles: ctx?.roles ?? ["sre"],
        },
        signal: abort.signal,
      });
      return {
        output: result.output,
        runId: result.id,
        status: result.status,
        requestId: ctx?.requestId,
        tenantId: ctx?.tenantId,
        userId: ctx?.userId,
      };
    } finally {
      abort.cleanup();
    }
  }

  @Post("executions/:id/approve")
  @HttpCode(200)
  approveExecution(@Param("id") id: string, @Req() req: VelumHttpRequest) {
    const ctx = req.velumContext;
    try {
      return this.velum.approveExecution(
        decodeURIComponent(id),
        ctx?.userId ?? "unknown",
        ctx?.roles ?? [],
      );
    } catch (error) {
      mapDomainError(error);
    }
  }

  @Post("executions/:id/reject")
  @HttpCode(200)
  rejectExecution(@Param("id") id: string, @Req() req: VelumHttpRequest) {
    const ctx = req.velumContext;
    try {
      return this.velum.rejectExecution(
        decodeURIComponent(id),
        ctx?.userId ?? "unknown",
        ctx?.roles ?? [],
      );
    } catch (error) {
      mapDomainError(error);
    }
  }
}
