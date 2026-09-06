#!/usr/bin/env node
/**
 * Minimal HTTP surface for Velum Grid alarm triage.
 * Agent proposes pages; approve/reject are external application endpoints.
 */

import { createServer } from "node:http";

import { createTriageAgent, runTriage } from "./agents/triage-agent.mjs";
import {
  approvePageProposal,
  getPageProposal,
  listAudit,
  listTickets,
  rejectPageProposal,
  resetAlarmStores,
} from "./domain/incident-service.mjs";
import { createFakeTriageModel } from "./fake-model.mjs";

const port = Number(process.env.PORT ?? 3230);

function getAgent(scenario) {
  return createTriageAgent(createFakeTriageModel(scenario));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (req.method === "POST" && url.pathname === "/alarms/triage") {
      const body = await readJson(req);
      const scenario = String(body.scenario ?? "pulsebeat-crash");
      const agent = getAgent(scenario);
      const result = await runTriage(agent, String(body.input ?? "Triage Velum Grid alarm"), {
        context: {
          tenantId: header(req, "x-tenant-id") ?? "velum-grid",
          userId: header(req, "x-user-id") ?? "triage-bot",
          requestId: header(req, "x-request-id") ?? `req-${Date.now()}`,
          roles: parseRoles(header(req, "x-roles") ?? "sre"),
        },
      });
      return send(res, 200, {
        output: result.output,
        runId: result.id,
        status: result.status,
      });
    }

    const approveMatch = url.pathname.match(/^\/pages\/([^/]+)\/approve$/);
    if (req.method === "POST" && approveMatch) {
      const body = await readJson(req);
      const out = approvePageProposal({
        proposalId: decodeURIComponent(approveMatch[1]),
        approvedBy: header(req, "x-user-id") ?? body.approvedBy ?? "unknown",
        roles: parseRoles(header(req, "x-roles") ?? body.roles?.join?.(",") ?? ""),
      });
      return send(res, 200, out);
    }

    const rejectMatch = url.pathname.match(/^\/pages\/([^/]+)\/reject$/);
    if (req.method === "POST" && rejectMatch) {
      const body = await readJson(req);
      const out = rejectPageProposal({
        proposalId: decodeURIComponent(rejectMatch[1]),
        rejectedBy: header(req, "x-user-id") ?? body.rejectedBy ?? "unknown",
        roles: parseRoles(header(req, "x-roles") ?? body.roles?.join?.(",") ?? ""),
      });
      return send(res, 200, out);
    }

    if (req.method === "GET" && url.pathname.startsWith("/pages/")) {
      const id = decodeURIComponent(url.pathname.slice("/pages/".length));
      return send(res, 200, {
        proposal: getPageProposal(id),
        audit: listAudit().filter((e) => e.proposalId === id),
      });
    }

    if (req.method === "GET" && url.pathname === "/tickets") {
      return send(res, 200, { tickets: listTickets() });
    }

    send(res, 404, { error: "not found" });
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error";
    const status =
      name === "PageProposalNotFoundError"
        ? 404
        : name === "PermissionDeniedError"
          ? 403
          : name === "ProposalConflictError"
            ? 409
            : 500;
    send(res, status, {
      error: error instanceof Error ? error.message : String(error),
      name,
    });
  }
});

const isMain = process.argv[1]?.includes("http.mjs");
if (isMain) {
  resetAlarmStores();
  server.listen(port, () => {
    console.log(`Velum Grid alarm-triage http on http://127.0.0.1:${port}`);
  });
}

export { server };

function header(req, name) {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

function parseRoles(raw) {
  return String(raw)
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}
