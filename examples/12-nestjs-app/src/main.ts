import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { AppModule } from "./app.module.js";
import { loadEnv } from "./env.js";

async function bootstrap() {
  loadEnv(resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    logger: ["error", "warn", "log"],
  });
  const port = Number(process.env.PORT ?? 3100);
  await app.listen(port);
  console.log(`AgentStride Nest app listening on http://localhost:${port}`);
  console.log(`POST /agent/run  body: { "input": "..." }`);
}

bootstrap();
