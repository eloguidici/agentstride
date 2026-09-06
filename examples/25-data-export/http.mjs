#!/usr/bin/env node
import { createServer } from "node:http";

import { createExportAgent, runExportGate } from "./agents/export-agent.mjs";
import {
  approveExportProposal,
  getExportProposal,
  listAudit,
  rejectExportProposal,
  resetExportStores,
} from "./domain/export-service.mjs";
import { createFakeExportModel } from "./fake-model.mjs";

const port = Number(process.env.PORT ?? 3250);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (req.method === "POST" && url.pathname === "/exports/gate") {
      const body = await readJson(req);
      const agent = createExportAgent(
        createFakeExportModel(String(body.scenario ?? "idvault-export")),
      );
      const result = await runExportGate(
        agent,
        String(body.input ?? "Gate Velum Grid export"),
        {
          context: {
            tenantId: header(req, "x-tenant-id") ?? "velum-grid",
            userId: header(req, "x-user-id") ?? "privacy-bot",
            requestId: header(req, "x-request-id") ?? `req-${Date.now()}`,
            roles: parseRoles(header(req, "x-roles") ?? "support"),
          },
        },
      );
      return send(res, 200, {
        output: result.output,
        runId: result.id,
        status: result.status,
      });
    }

    const approveMatch = url.pathname.match(/^\/exports\/([^/]+)\/approve$/);
    if (req.method === "POST" && approveMatch) {
      const body = await readJson(req);
      return send(
        res,
        200,
        approveExportProposal({
          proposalId: decodeURIComponent(approveMatch[1]),
          approvedBy: header(req, "x-user-id") ?? body.approvedBy ?? "unknown",
          roles: parseRoles(header(req, "x-roles") ?? ""),
        }),
      );
    }

    const rejectMatch = url.pathname.match(/^\/exports\/([^/]+)\/reject$/);
    if (req.method === "POST" && rejectMatch) {
      const body = await readJson(req);
      return send(
        res,
        200,
        rejectExportProposal({
          proposalId: decodeURIComponent(rejectMatch[1]),
          rejectedBy: header(req, "x-user-id") ?? body.rejectedBy ?? "unknown",
          roles: parseRoles(header(req, "x-roles") ?? ""),
        }),
      );
    }

    if (req.method === "GET" && url.pathname.startsWith("/exports/")) {
      const id = decodeURIComponent(url.pathname.slice("/exports/".length));
      return send(res, 200, {
        proposal: getExportProposal(id),
        audit: listAudit().filter((e) => e.proposalId === id),
      });
    }

    send(res, 404, { error: "not found" });
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error";
    const status =
      name === "ExportProposalNotFoundError"
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
  resetExportStores();
  server.listen(port, () => {
    console.log(`Velum Grid data-export http on http://127.0.0.1:${port}`);
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
