import { defineTool, type Tool } from "./tool.js";
import {
  ABORT_SIGNAL_CONTEXT_KEY,
  AGENT_RUN_ID_CONTEXT_KEY,
} from "./runtime-helpers.js";
import { ToolInputValidationError } from "./schema.js";
import type { AgentContext, AgentLike } from "./types.js";

export type AgentAsToolOptions = Readonly<{
  name: string;
  description: string;
}>;

/** JSON Schema published to the model for nested-agent tools. */
export const AGENT_AS_TOOL_PARAMETERS = {
  type: "object",
  properties: {
    request: {
      type: "string",
      description: "Request string forwarded to the nested agent",
    },
  },
  required: ["request"],
  additionalProperties: false,
} as const;

/**
 * Expose another agent as a portable tool for local delegation.
 *
 * Forwards:
 * - parent AbortSignal (`context.abortSignal` → `run({ signal })`)
 * - parent run id (`context.agentRunId` → `run({ parentRunId })`)
 *
 * Publishes `{ request: string }` JSON Schema parameters so providers
 * receive a real argument shape (no Zod wrap required).
 */
export function asAgentTool(
  agent: AgentLike<string, { text: string }>,
  options: AgentAsToolOptions,
): Tool<{ request: string }, string> {
  return defineTool({
    name: options.name,
    description: options.description,
    parameters: {
      type: "object",
      properties: {
        request: {
          type: "string",
          description: "Request string forwarded to the nested agent",
        },
      },
      required: ["request"],
      additionalProperties: false,
    },
    execute: async (input: { request: string }, context: AgentContext) => {
      if (
        input === null ||
        typeof input !== "object" ||
        typeof input.request !== "string"
      ) {
        throw new ToolInputValidationError(options.name, [
          { message: 'expected object input with string "request"' },
        ]);
      }
      const signal = readContextAbortSignal(context);
      const parentRunId = readContextAgentRunId(context);
      const result = await agent.run(input.request, {
        context,
        ...(signal !== undefined ? { signal } : {}),
        ...(parentRunId !== undefined ? { parentRunId } : {}),
      });
      return result.text;
    },
  });
}

function readContextAbortSignal(
  context: AgentContext,
): AbortSignal | undefined {
  const value = context[ABORT_SIGNAL_CONTEXT_KEY];
  return value instanceof AbortSignal ? value : undefined;
}

function readContextAgentRunId(context: AgentContext): string | undefined {
  const value = context[AGENT_RUN_ID_CONTEXT_KEY];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
