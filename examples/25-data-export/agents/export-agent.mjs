import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import {
  findInventory,
  openExportCaseService,
  proposeExportService,
} from "../domain/export-service.mjs";
import {
  normalizeExportRequest,
  suggestExportAction,
} from "../domain/normalize.mjs";
import { exportResultSchema } from "../domain/result-schema.mjs";

export function createExportTools() {
  const normalizeAndAssess = defineTool({
    name: "normalizeAndAssess",
    description:
      "Normalize a Velum Grid SAR/export request (idvault|mailroom|ledgerflare-pii)",
    inputSchema: z.object({ raw: z.unknown() }),
    execute({ raw }) {
      const normalized = normalizeExportRequest(raw);
      const suggestion = suggestExportAction(normalized);
      const inventory = findInventory(normalized.subjectEmail);
      return { normalized, suggestion, inventory };
    },
  });

  const openExportCase = defineTool({
    name: "openExportCase",
    description: "Open an idempotent SAR case by fingerprint. Does not export.",
    inputSchema: z.object({
      fingerprint: z.string(),
      source: z.string(),
      team: z.string(),
      subjectEmail: z.string(),
      category: z.enum(["acknowledge", "export", "regulator-export"]),
    }),
    async execute({ fingerprint, source, team, subjectEmail, category }, context) {
      return openExportCaseService({
        fingerprint,
        source,
        team,
        subjectEmail,
        category,
        requestId: String(context.requestId ?? "unknown"),
        openedBy: String(context.userId ?? "unknown"),
      });
    },
  });

  const proposeExport = defineTool({
    name: "proposeExport",
    description:
      "Propose a subject data export package. Does NOT export. Needs privacy-officer approval.",
    inputSchema: z.object({
      fingerprint: z.string(),
      source: z.string(),
      team: z.string(),
      subjectEmail: z.string(),
      reason: z.string(),
    }),
    execute({ fingerprint, source, team, subjectEmail, reason }, context) {
      return proposeExportService({
        fingerprint,
        source,
        team,
        subjectEmail,
        reason,
        requestedBy: String(context.userId ?? "unknown"),
        requestId: String(context.requestId ?? "unknown"),
        agentRunId:
          typeof context.agentRunId === "string" ? context.agentRunId : null,
      });
    },
  });

  return { normalizeAndAssess, openExportCase, proposeExport };
}

export function createExportAgent(model, options = {}) {
  const tools = createExportTools();
  const agent = createAgent({
    model,
    instructions: [
      "You handle Velum Grid subject-access / data-export requests.",
      "Always call normalizeAndAssess first.",
      "acknowledge → openExportCase only.",
      "export / regulator-export → openExportCase and proposeExport.",
      "There is no approveExport tool. Keep exported=false.",
      "Return structured export-gate output.",
    ].join(" "),
    tools,
    maxSteps: options.maxSteps ?? 8,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
  });
  return { agent, tools, outputSchema: exportResultSchema };
}

export async function runExportGate(agentBundle, input, runOptions = {}) {
  return agentBundle.agent.run(input, {
    ...runOptions,
    output: agentBundle.outputSchema,
  });
}
