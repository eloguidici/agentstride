import { MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";
import type { Agent } from "@agentstride/core";
import {
  AGENTSTRIDE_AGENT,
  AgentStrideService,
} from "@agentstride/nestjs";

import { AgentController } from "./agent.controller.js";
import { createAppAgent } from "./agent.factory.js";
import { RequestContextMiddleware } from "./request-context.middleware.js";

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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
