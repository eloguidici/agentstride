import { defineTool, type Tool } from "./tool.js";
import { ABORT_SIGNAL_CONTEXT_KEY } from "./runtime-helpers.js";
import type { AgentContext, AgentLike } from "./types.js";

export type AgentAsToolOptions = Readonly<{
  name: string;
  description: string;
}>;

/**
 * Expose another agent as a portable tool for local delegation.
 *
 * Forwards the parent run's AbortSignal (from context.abortSignal) into
 * nested `agent.run({ signal })` so cancellation crosses asAgentTool.
 */
export function asAgentTool(
  agent: AgentLike<string, { text: string }>,
  options: AgentAsToolOptions,
): Tool<{ request: string }, string> {
  return defineTool({
    name: options.name,
    description: options.description,
    execute: async (input: { request: string }, context: AgentContext) => {
      const signal = readContextAbortSignal(context);
      const result = await agent.run(input.request, {
        context,
        ...(signal !== undefined ? { signal } : {}),
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
