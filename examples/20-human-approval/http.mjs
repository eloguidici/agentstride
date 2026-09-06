#!/usr/bin/env node
/**
 * Minimal HTTP surface (no Nest): agent run + external approve/reject.
 * Demonstrates that approval is an application endpoint, not an agent tool.
 */

import { createServer } from "node:http";

import {
  createApprovalReceptionist,
  runApprovalReceptionist,
} from "./agents/receptionist.mjs";
import { resetAuditLog, listAuditEntries } from "./domain/audit-service.mjs";
import { resetCustomerStore } from "./domain/customer-service.mjs";
import {
  ProposalConflictError,
  ProposalExpiredError,
  ProposalNotFoundError,
  approveProposedAction,
  getProposedAction,
  rejectProposedAction,
  resetProposalStore,
} from "./domain/proposal-service.mjs";
import { PermissionDeniedError } from "./domain/permissions.mjs";
import { createFakeApprovalModel } from "./fake-model.mjs";

const port = Number(process.env.PORT ?? 3210);

function getReceptionist() {
  return createApprovalReceptionist(createFakeApprovalModel());
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (req.method === "POST" && url.pathname === "/support/run") {
      const body = await readJson(req);
      const receptionist = getReceptionist();
      const result = await runApprovalReceptionist(
        receptionist,
        String(body.input ?? ""),
        {
          context: {
            tenantId: header(req, "x-tenant-id") ?? "acme",
            userId: header(req, "x-user-id") ?? "op-1",
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

    const approveMatch = url.pathname.match(/^\/actions\/([^/]+)\/approve$/);
    if (req.method === "POST" && approveMatch) {
      const body = await readJson(req);
      const out = approveProposedAction({
        proposalId: decodeURIComponent(approveMatch[1]),
        approvedBy: header(req, "x-user-id") ?? body.approvedBy ?? "unknown",
        roles: parseRoles(header(req, "x-roles") ?? body.roles?.join?.(",") ?? "admin"),
      });
      return send(res, 200, out);
    }

    const rejectMatch = url.pathname.match(/^\/actions\/([^/]+)\/reject$/);
    if (req.method === "POST" && rejectMatch) {
      const body = await readJson(req);
      const out = rejectProposedAction({
        proposalId: decodeURIComponent(rejectMatch[1]),
        rejectedBy: header(req, "x-user-id") ?? body.rejectedBy ?? "unknown",
        roles: parseRoles(header(req, "x-roles") ?? body.roles?.join?.(",") ?? "admin"),
        reason: body.reason ?? "rejected",
      });
      return send(res, 200, out);
    }

    if (req.method === "GET" && url.pathname.startsWith("/actions/")) {
      const id = decodeURIComponent(url.pathname.slice("/actions/".length));
      return send(res, 200, {
        proposal: getProposedAction(id),
        audit: listAuditEntries().filter((e) => e.proposalId === id),
      });
    }

    send(res, 404, { error: "not found" });
  } catch (error) {
    const status =
      error instanceof ProposalNotFoundError
        ? 404
        : error instanceof PermissionDeniedError
          ? 403
          : error instanceof ProposalExpiredError ||
              error instanceof ProposalConflictError
            ? 409
            : 500;
    send(res, status, {
      error: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Error",
    });
  }
});

const isMain = process.argv[1]?.includes("http.mjs");
if (isMain) {
  resetCustomerStore();
  resetProposalStore();
  resetAuditLog();
  server.listen(port, () => {
    console.log(`human-approval http on http://127.0.0.1:${port}`);
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
