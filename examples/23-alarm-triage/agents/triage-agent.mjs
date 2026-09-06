import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import {
  openTicketService,
  proposePageService,
} from "../domain/incident-service.mjs";
import { normalizeAlarm, suggestCategory } from "../domain/normalize.mjs";
import { triageResultSchema } from "../domain/result-schema.mjs";

export function createTriageTools() {
  const normalizeAndAssess = defineTool({
    name: "normalizeAndAssess",
    description:
      "Normalize a raw Velum Grid alarm (pulsebeat|wirewatch|ledgerflare) and suggest category/action",
    inputSchema: z.object({
      raw: z.unknown(),
    }),
    execute({ raw }) {
      const normalized = normalizeAlarm(raw);
      const suggestion = suggestCategory(normalized);
      return { normalized, suggestion };
    },
  });

  const openTicket = defineTool({
    name: "openTicket",
    description:
      "Open an idempotent ticket for a warning/incident fingerprint. Safe to retry.",
    inputSchema: z.object({
      fingerprint: z.string(),
      source: z.string(),
      team: z.string(),
      summary: z.string(),
    }),
    async execute({ fingerprint, source, team, summary }, context) {
      return openTicketService({
        fingerprint,
        source,
        team,
        summary,
        requestId: String(context.requestId ?? "unknown"),
        openedBy: String(context.userId ?? "unknown"),
      });
    },
  });

  const proposePage = defineTool({
    name: "proposePage",
    description:
      "Propose paging on-call for a high severity incident. Does NOT page. Requires external approval.",
    inputSchema: z.object({
      fingerprint: z.string(),
      source: z.string(),
      team: z.string(),
      reason: z.string(),
    }),
    execute({ fingerprint, source, team, reason }, context) {
      return proposePageService({
        fingerprint,
        source,
        team,
        reason,
        requestedBy: String(context.userId ?? "unknown"),
        requestId: String(context.requestId ?? "unknown"),
        agentRunId:
          typeof context.agentRunId === "string" ? context.agentRunId : null,
      });
    },
  });

  return { normalizeAndAssess, openTicket, proposePage };
}

export function createTriageAgent(model, options = {}) {
  const tools = createTriageTools();
  const agent = createAgent({
    model,
    instructions: [
      "You triage Velum Grid alarms from pulsebeat, wirewatch, and ledgerflare.",
      "Always call normalizeAndAssess first.",
      "noise → action drop (no ticket, no page).",
      "warning → openTicket.",
      "incident → openTicket and proposePage (never page yourself).",
      "There is no approvePage tool. Keep paged=false.",
      "Return structured triage output.",
    ].join(" "),
    tools,
    maxSteps: options.maxSteps ?? 8,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
  });
  return { agent, tools, outputSchema: triageResultSchema };
}

export async function runTriage(agentBundle, input, runOptions = {}) {
  return agentBundle.agent.run(input, {
    ...runOptions,
    output: agentBundle.outputSchema,
  });
}
