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
  const port = Number(process.env.PORT ?? 3260);
  await app.listen(port);
  console.log(`Velum Grid Nest HTTP on http://localhost:${port}`);
  console.log(`POST /alarms/triage  body: { "input"?, "scenario"? }`);
  console.log(`POST /changes/gate   body: { "input"?, "scenario"? }`);
  if (process.env.AGENT_API_KEY) {
    console.log("Auth: send header x-api-key");
  }
  console.log("Mode: fake Velum models (VELUM_FAKE)");
}

bootstrap();
