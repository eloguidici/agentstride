import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.AGENT_API_KEY;
    if (!expected) {
      return true;
    }

    const req = context.switchToHttp().getRequest() as {
      headers: Record<string, string | string[] | undefined>;
    };
    const header = req.headers["x-api-key"];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || provided !== expected) {
      throw new UnauthorizedException("Invalid or missing x-api-key");
    }

    return true;
  }
}
