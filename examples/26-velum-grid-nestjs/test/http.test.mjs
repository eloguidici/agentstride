import "reflect-metadata";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";

import { RequestContextMiddleware } from "../dist/request-context.middleware.js";
import { createVelumGridBundle } from "../dist/velum.factory.js";
import { VelumController } from "../dist/velum.controller.js";
import { VELUM_GRID, VelumGridService } from "../dist/velum.service.js";

class TestAppModule {
  configure(consumer) {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}

Module({
  controllers: [VelumController],
  providers: [
    {
      provide: VELUM_GRID,
      useFactory: async () => createVelumGridBundle({ fake: true }),
    },
    {
      provide: VelumGridService,
      useFactory: (bundle) => new VelumGridService(bundle),
      inject: [VELUM_GRID],
    },
  ],
})(TestAppModule);

describe("velum grid Nest HTTP", () => {
  let app;
  let baseUrl;

  before(async () => {
    process.env.AGENT_API_KEY = "test-secret";
    process.env.VELUM_FAKE = "1";

    app = await NestFactory.create(TestAppModule, new ExpressAdapter(), {
      logger: false,
    });
    app.get(VelumGridService).resetStores();
    await app.listen(0);
    const address = app.getHttpServer().address();
    assert.ok(address && typeof address === "object");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await app.close();
    delete process.env.AGENT_API_KEY;
    delete process.env.VELUM_FAKE;
  });

  it("rejects missing api key", async () => {
    const res = await fetch(`${baseUrl}/alarms/triage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenario: "pulsebeat-crash" }),
    });
    assert.equal(res.status, 401);
  });

  it("triages pulsebeat-crash then approves page with sre-approver", async () => {
    const runRes = await fetch(`${baseUrl}/alarms/triage`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "test-secret",
        "x-tenant-id": "velum-grid",
        "x-request-id": "req-nest-alarm-1",
        "x-user-id": "triage-bot",
        "x-roles": "sre",
      },
      body: JSON.stringify({
        input: "Triage pulsebeat crash",
        scenario: "pulsebeat-crash",
      }),
    });

    assert.equal(runRes.status, 200);
    assert.equal(runRes.headers.get("x-request-id"), "req-nest-alarm-1");
    const runBody = await runRes.json();
    assert.equal(runBody.status, "completed");
    assert.equal(runBody.output?.requiresHumanApproval, true);
    assert.equal(runBody.output?.paged, false);
    assert.ok(runBody.output?.pageProposalId);

    const approveRes = await fetch(
      `${baseUrl}/pages/${runBody.output.pageProposalId}/approve`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "test-secret",
          "x-user-id": "sre-lead-mira",
          "x-roles": "sre-approver",
        },
        body: "{}",
      },
    );
    const approveBody = await approveRes.json();
    assert.equal(approveRes.status, 200);
    assert.equal(approveBody.proposal?.paged, true);
  });

  it("gates shipyard-hotfix then approves execute with change-approver", async () => {
    const runRes = await fetch(`${baseUrl}/changes/gate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "test-secret",
        "x-tenant-id": "velum-grid",
        "x-request-id": "req-nest-change-1",
        "x-user-id": "change-bot",
        "x-roles": "sre",
      },
      body: JSON.stringify({
        input: "Gate hotfix",
        scenario: "shipyard-hotfix",
      }),
    });

    assert.equal(runRes.status, 200);
    const runBody = await runRes.json();
    assert.equal(runBody.status, "completed");
    assert.equal(runBody.output?.executed, false);
    assert.ok(runBody.output?.executeProposalId);

    const approveRes = await fetch(
      `${baseUrl}/executions/${runBody.output.executeProposalId}/approve`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "test-secret",
          "x-user-id": "change-lead-nova",
          "x-roles": "change-approver",
        },
        body: "{}",
      },
    );
    const approveBody = await approveRes.json();
    assert.equal(approveRes.status, 200);
    assert.equal(approveBody.proposal?.executed, true);
  });
});
