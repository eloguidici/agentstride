import { MiddlewareConsumer, Module, type NestModule } from "@nestjs/common";

import { RequestContextMiddleware } from "./request-context.middleware.js";
import { createEnterpriseReceptionist } from "./support.factory.js";
import { SupportController } from "./support.controller.js";
import {
  ENTERPRISE_SUPPORT,
  EnterpriseSupportService,
} from "./support.service.js";

@Module({
  controllers: [SupportController],
  providers: [
    {
      provide: ENTERPRISE_SUPPORT,
      useFactory: async () => createEnterpriseReceptionist(),
    },
    {
      provide: EnterpriseSupportService,
      useFactory: (bundle: Awaited<ReturnType<typeof createEnterpriseReceptionist>>) =>
        new EnterpriseSupportService(bundle),
      inject: [ENTERPRISE_SUPPORT],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
