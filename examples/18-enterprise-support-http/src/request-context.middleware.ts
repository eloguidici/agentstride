import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";

export type SupportRequestContext = {
  requestId: string;
  tenantId: string;
  userId: string;
  roles: string[];
};

type HttpReq = {
  header(name: string): string | undefined;
  supportContext?: SupportRequestContext;
};

type HttpRes = {
  setHeader(name: string, value: string): void;
};

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: HttpReq, res: HttpRes, next: () => void) {
    const requestIdHeader = req.header("x-request-id");
    const tenantHeader = req.header("x-tenant-id");
    const userHeader = req.header("x-user-id");
    const rolesHeader = req.header("x-roles");

    const requestId =
      requestIdHeader && requestIdHeader.trim().length > 0
        ? requestIdHeader.trim()
        : randomUUID();
    const tenantId =
      tenantHeader && tenantHeader.trim().length > 0
        ? tenantHeader.trim()
        : "demo";
    const userId =
      userHeader && userHeader.trim().length > 0 ? userHeader.trim() : "anonymous";
    const roles =
      rolesHeader && rolesHeader.trim().length > 0
        ? rolesHeader.split(",").map((r) => r.trim()).filter(Boolean)
        : ["support"];

    req.supportContext = { requestId, tenantId, userId, roles };
    res.setHeader("x-request-id", requestId);
    next();
  }
}
