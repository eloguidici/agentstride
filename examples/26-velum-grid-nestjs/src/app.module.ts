import {
  MiddlewareConsumer,
  Module,
  type NestModule,
  type OnModuleInit,
} from "@nestjs/common";

import { RequestContextMiddleware } from "./request-context.middleware.js";
import { createVelumGridBundle } from "./velum.factory.js";
import { VelumController } from "./velum.controller.js";
import { VELUM_GRID, VelumGridService } from "./velum.service.js";

@Module({
  controllers: [VelumController],
  providers: [
    {
      provide: VELUM_GRID,
      useFactory: async () => createVelumGridBundle({ fake: true }),
    },
    {
      provide: VelumGridService,
      useFactory: (bundle: Awaited<ReturnType<typeof createVelumGridBundle>>) =>
        new VelumGridService(bundle),
      inject: [VELUM_GRID],
    },
  ],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly velum: VelumGridService) {}

  onModuleInit() {
    this.velum.resetStores();
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
