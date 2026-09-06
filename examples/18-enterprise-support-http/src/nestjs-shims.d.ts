declare module "@nestjs/common" {
  export function Injectable(): ClassDecorator;
  export function Controller(path?: string): ClassDecorator;
  export function Post(path?: string): MethodDecorator;
  export function HttpCode(code: number): MethodDecorator;
  export function Body(): ParameterDecorator;
  export function Req(): ParameterDecorator;
  export function UseGuards(
    ...guards: unknown[]
  ): ClassDecorator & MethodDecorator;
  export function Module(metadata: Record<string, unknown>): ClassDecorator;

  export class UnauthorizedException extends Error {
    constructor(message?: string);
  }

  export interface CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
  }

  export interface ExecutionContext {
    switchToHttp(): {
      getRequest(): {
        headers: Record<string, string | string[] | undefined>;
      };
    };
  }

  export interface NestMiddleware {
    use(req: unknown, res: unknown, next: () => void): void;
  }

  export interface NestModule {
    configure(consumer: MiddlewareConsumer): void;
  }

  export interface MiddlewareConsumer {
    apply(
      ...middleware: unknown[]
    ): {
      forRoutes(...routes: unknown[]): unknown;
    };
  }
}

declare module "@nestjs/core" {
  export class NestFactory {
    static create(
      module: unknown,
      adapter?: unknown,
      options?: Record<string, unknown>,
    ): Promise<{
      listen(port: number): Promise<unknown>;
      close(): Promise<void>;
      getHttpServer(): { address(): unknown };
    }>;
  }
}

declare module "@nestjs/platform-express" {
  export class ExpressAdapter {
    constructor(instance?: unknown);
  }
}
