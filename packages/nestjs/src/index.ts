import {
  createAgent,
  type Agent,
  type AgentConfig,
  type Model,
} from "@agentstride/core";

export const AGENTSTRIDE_MODEL = "AGENTSTRIDE_MODEL";
export const AGENTSTRIDE_AGENT = "AGENTSTRIDE_AGENT";
export const AGENTSTRIDE_OPTIONS = "AGENTSTRIDE_OPTIONS";

export type AgentStrideModuleOptions = Omit<AgentConfig, "model"> & {
  model: Model;
};

export type NestProvider = Readonly<{
  provide: string | (new (...args: never[]) => unknown);
  useValue?: unknown;
  useFactory?: (...args: never[]) => unknown;
  inject?: Array<string | (new (...args: never[]) => unknown)>;
}>;

export type NestDynamicModule = Readonly<{
  module: typeof AgentStrideModule;
  providers: NestProvider[];
  exports: Array<string | typeof AgentStrideService>;
}>;

export class AgentStrideService {
  constructor(readonly agent: Agent) {}
}

/**
 * Nest-compatible dynamic module factory.
 * Avoids a hard compile-time dependency on @nestjs/common.
 */
export class AgentStrideModule {
  static forRoot(options: AgentStrideModuleOptions): NestDynamicModule {
    const agent = createAgent(options);

    return {
      module: AgentStrideModule,
      providers: [
        { provide: AGENTSTRIDE_OPTIONS, useValue: options },
        { provide: AGENTSTRIDE_MODEL, useValue: options.model },
        { provide: AGENTSTRIDE_AGENT, useValue: agent },
        {
          provide: AgentStrideService,
          useFactory: ((resolvedAgent: Agent) =>
            new AgentStrideService(resolvedAgent)) as (
            ...args: never[]
          ) => unknown,
          inject: [AGENTSTRIDE_AGENT],
        },
      ],
      exports: [AgentStrideService, AGENTSTRIDE_AGENT, AGENTSTRIDE_MODEL],
    };
  }
}
