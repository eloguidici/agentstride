import type { Tool } from "./tool.js";
import type {
  AgentContext,
  AgentMessage,
  AgentRunResult,
  Model,
  ToolCall,
  ToolDefinition,
} from "./types.js";

export type AgentRunOptions = Readonly<{
  context?: AgentContext;
}>;

export type AgentConfig = Readonly<{
  model: Model;
  instructions?: string;
  tools?: Readonly<Record<string, Tool<unknown, unknown>>>;
  maxSteps?: number;
}>;

export interface Agent {
  run(input: string, options?: AgentRunOptions): Promise<AgentRunResult>;
}

const DEFAULT_MAX_STEPS = 8;

export function createAgent(config: AgentConfig): Agent {
  const maxSteps = config.maxSteps ?? DEFAULT_MAX_STEPS;

  if (!Number.isInteger(maxSteps) || maxSteps < 1) {
    throw new Error("maxSteps must be a positive integer");
  }

  const tools = config.tools ?? {};
  const toolDefinitions: ToolDefinition[] = Object.values(tools).map((tool) => ({
    name: tool.name,
    description: tool.description,
  }));

  return {
    async run(input, options = {}) {
      const context = options.context ?? {};
      const messages: AgentMessage[] = [];

      if (config.instructions) {
        messages.push({ role: "system", content: config.instructions });
      }

      messages.push({ role: "user", content: input });

      for (let step = 1; step <= maxSteps; step += 1) {
        const response = await config.model.generate({
          messages,
          tools: toolDefinitions,
        });
        const toolCalls = response.toolCalls ?? [];

        messages.push({
          role: "assistant",
          ...(response.text !== undefined ? { content: response.text } : {}),
          ...(toolCalls.length > 0 ? { toolCalls } : {}),
        });

        if (toolCalls.length === 0) {
          return {
            text: response.text ?? "",
            steps: step,
            messages,
          };
        }

        for (const call of toolCalls) {
          const output = await executeTool(call, tools, context);

          messages.push({
            role: "tool",
            name: call.name,
            ...(call.id !== undefined ? { toolCallId: call.id } : {}),
            output,
          });
        }
      }

      throw new Error(`Agent exceeded maxSteps (${maxSteps})`);
    },
  };
}

async function executeTool(
  call: ToolCall,
  tools: Readonly<Record<string, Tool<unknown, unknown>>>,
  context: AgentContext,
): Promise<unknown> {
  const tool = tools[call.name];

  if (!tool) {
    throw new Error(`Model requested unknown tool: ${call.name}`);
  }

  return tool.execute(call.input, context);
}
