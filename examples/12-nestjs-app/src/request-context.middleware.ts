import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";

export type AgentRequestContext = {
  requestId: string;
  tenantId: string;
};

type HttpReq = {
  header(name: string): string | undefined;
  agentContext?: AgentRequestContext;
};

type HttpRes = {
  setHeader(name: string, value: string): void;
};

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: HttpReq, res: HttpRes, next: () => void) {
    const requestIdHeader = req.header("x-request-id");
    const tenantHeader = req.header("x-tenant-id");

    const requestId =
      requestIdHeader && requestIdHeader.trim().length > 0
        ? requestIdHeader.trim()
        : randomUUID();
    const tenantId =
      tenantHeader && tenantHeader.trim().length > 0
        ? tenantHeader.trim()
        : "demo";

    req.agentContext = { requestId, tenantId };
    res.setHeader("x-request-id", requestId);
    next();
  }
}
