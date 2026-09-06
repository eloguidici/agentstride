import { defineTool, type Tool } from "./tool.js";
import type { AgentContext, AgentLike } from "./types.js";

export type AgentAsToolOptions = Readonly<{
  name: string;
  description: string;
}>;

/**
 * Expose another agent as a portable tool for local delegation.
 */
export function asAgentTool(
  agent: AgentLike<string, { text: string }>,
  options: AgentAsToolOptions,
): Tool<{ request: string }, string> {
  return defineTool({
    name: options.name,
    description: options.description,
    execute: async (input: { request: string }, context: AgentContext) => {
      const result = await agent.run(input.request, { context });
      return result.text;
    },
  });
}
