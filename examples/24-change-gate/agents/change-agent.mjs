import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

import {
  openChangeRecordService,
  proposeExecuteService,
} from "../domain/change-service.mjs";
import { normalizeChange, suggestChangeAction } from "../domain/normalize.mjs";
import { changeResultSchema } from "../domain/result-schema.mjs";

export function createChangeTools() {
  const normalizeAndAssess = defineTool({
    name: "normalizeAndAssess",
    description:
      "Normalize a raw Velum Grid change (shipyard|wiredesk|ledgerops) and suggest action",
    inputSchema: z.object({
      raw: z.unknown(),
    }),
    execute({ raw }) {
      const normalized = normalizeChange(raw);
      const suggestion = suggestChangeAction(normalized);
      return { normalized, suggestion };
    },
  });

  const openChangeRecord = defineTool({
    name: "openChangeRecord",
    description:
      "Record an idempotent change by fingerprint. Safe to retry. Does not execute.",
    inputSchema: z.object({
      fingerprint: z.string(),
      source: z.string(),
      team: z.string(),
      title: z.string(),
      category: z.enum(["routine", "elevated", "emergency"]),
    }),
    async execute({ fingerprint, source, team, title, category }, context) {
      return openChangeRecordService({
        fingerprint,
        source,
        team,
        title,
        category,
        requestId: String(context.requestId ?? "unknown"),
        openedBy: String(context.userId ?? "unknown"),
      });
    },
  });

  const proposeExecute = defineTool({
    name: "proposeExecute",
    description:
      "Propose executing an elevated/emergency change. Does NOT execute. Needs external approval.",
    inputSchema: z.object({
      fingerprint: z.string(),
      source: z.string(),
      team: z.string(),
      reason: z.string(),
    }),
    execute({ fingerprint, source, team, reason }, context) {
      return proposeExecuteService({
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

  return { normalizeAndAssess, openChangeRecord, proposeExecute };
}

export function createChangeAgent(model, options = {}) {
  const tools = createChangeTools();
  const agent = createAgent({
    model,
    instructions: [
      "You gate Velum Grid changes from shipyard, wiredesk, and ledgerops.",
      "Always call normalizeAndAssess first.",
      "routine → openChangeRecord only (action record).",
      "elevated or emergency → openChangeRecord and proposeExecute.",
      "There is no approveExecute tool. Keep executed=false.",
      "Return structured change-gate output.",
    ].join(" "),
    tools,
    maxSteps: options.maxSteps ?? 8,
    ...(options.onEvent ? { onEvent: options.onEvent } : {}),
  });
  return { agent, tools, outputSchema: changeResultSchema };
}

export async function runChangeGate(agentBundle, input, runOptions = {}) {
  return agentBundle.agent.run(input, {
    ...runOptions,
    output: agentBundle.outputSchema,
  });
}
