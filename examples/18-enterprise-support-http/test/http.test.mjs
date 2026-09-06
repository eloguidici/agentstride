import "reflect-metadata";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";

import { RequestContextMiddleware } from "../dist/request-context.middleware.js";
import { createEnterpriseReceptionist } from "../dist/support.factory.js";
import { SupportController } from "../dist/support.controller.js";
import {
  ENTERPRISE_SUPPORT,
  EnterpriseSupportService,
} from "../dist/support.service.js";

class TestAppModule {
  configure(consumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}

Module({
  controllers: [SupportController],
  providers: [
    {
      provide: ENTERPRISE_SUPPORT,
      useFactory: async () =>
        createEnterpriseReceptionist({ fake: true }),
    },
    {
      provide: EnterpriseSupportService,
      useFactory: (bundle) => new EnterpriseSupportService(bundle),
      inject: [ENTERPRISE_SUPPORT],
    },
  ],
})(TestAppModule);

describe("enterprise support HTTP", () => {
  let app;
  let baseUrl;

  before(async () => {
    process.env.AGENT_API_KEY = "test-secret";
    process.env.ENTERPRISE_FAKE = "1";

    app = await NestFactory.create(TestAppModule, new ExpressAdapter(), {
      logger: false,
    });
    await app.listen(0);
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await app.close();
    delete process.env.AGENT_API_KEY;
    delete process.env.ENTERPRISE_FAKE;
  });

  it("rejects missing api key", async () => {
    const res = await fetch(`${baseUrl}/support/run`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: "Customer ACME cannot access production.",
      }),
    });
    assert.equal(res.status, 401);
  });

  it("runs enterprise receptionist with context headers", async () => {
    const res = await fetch(`${baseUrl}/support/run`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "test-secret",
        "x-tenant-id": "acme",
        "x-request-id": "req-http-1",
        "x-user-id": "user-9",
        "x-roles": "support",
      },
      body: JSON.stringify({
        input:
          "Customer ACME cannot access production. Check account and open a case.",
      }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("x-request-id"), "req-http-1");
    const body = await res.json();
    assert.equal(body.status, "completed");
    assert.equal(body.tenantId, "acme");
    assert.equal(body.userId, "user-9");
    assert.equal(body.output?.decision, "ticket-created");
    assert.equal(body.output?.requiresHumanApproval, true);
  });

  it("requires input", async () => {
    const res = await fetch(`${baseUrl}/support/run`, {
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
