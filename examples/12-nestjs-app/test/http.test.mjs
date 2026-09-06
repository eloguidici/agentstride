import "reflect-metadata";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import {
  AGENTSTRIDE_AGENT,
  AgentStrideService,
} from "@agentstride/nestjs";

import { AgentController } from "../dist/agent.controller.js";
import { createFakeAppAgent } from "../dist/agent.factory.js";
import { RequestContextMiddleware } from "../dist/request-context.middleware.js";

class TestAppModule {
  configure(consumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}

Module({
  controllers: [AgentController],
  providers: [
    {
      provide: AGENTSTRIDE_AGENT,
      useFactory: () => createFakeAppAgent(),
    },
    {
      provide: AgentStrideService,
      useFactory: (agent) => new AgentStrideService(agent),
      inject: [AGENTSTRIDE_AGENT],
    },
  ],
})(TestAppModule);

describe("nestjs HTTP agent", () => {
  let app;
  let baseUrl;

  before(async () => {
    process.env.AGENT_API_KEY = "test-secret";

    app = await NestFactory.create(TestAppModule, new ExpressAdapter(), {
      logger: false,
    });
    await app.listen(0);
    const server = app.getHttpServer();
    const address = server.address();
    assert.ok(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await app.close();
    delete process.env.AGENT_API_KEY;
  });

  it("rejects missing api key", async () => {
    const res = await fetch(`${baseUrl}/agent/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input: "Find customer 42" }),
    });
    assert.equal(res.status, 401);
  });

  it("runs agent with auth and request context", async () => {
    const res = await fetch(`${baseUrl}/agent/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "test-secret",
        "x-tenant-id": "acme",
        "x-request-id": "req-123",
      },
      body: JSON.stringify({ input: "Find customer 42" }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-request-id"), "req-123");

    const body = await res.json();
    assert.equal(body.status, "completed");
    assert.equal(body.tenantId, "acme");
    assert.equal(body.requestId, "req-123");
    assert.match(String(body.text), /Ada Lovelace/i);
  });

  it("requires input", async () => {
    const res = await fetch(`${baseUrl}/agent/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "test-secret",
      },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.error, "body.input is required");
  });
});
