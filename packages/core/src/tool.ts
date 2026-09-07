import type { StandardSchemaV1 } from "@standard-schema/spec";

import {
  getSchemaJsonSchema,
  type JsonSchemaObject,
} from "./schema.js";
import type { AgentContext } from "./types.js";

export interface Tool<TInput = unknown, TOutput = unknown> {
  readonly name: string;
  readonly description: string;
  readonly inputSchema?: StandardSchemaV1<unknown, TInput>;
  readonly parameters?: JsonSchemaObject;
  execute(input: TInput, context: AgentContext): Promise<TOutput> | TOutput;
}

type ToolConfigWithSchema<TSchema extends StandardSchemaV1, TOutput> = {
  name: string;
  description: string;
  inputSchema: TSchema;
  parameters?: JsonSchemaObject;
  execute(
    input: StandardSchemaV1.InferOutput<TSchema>,
    context: AgentContext,
  ): Promise<TOutput> | TOutput;
};

type ToolConfigWithoutSchema<TInput, TOutput> = {
  name: string;
  description: string;
  parameters?: JsonSchemaObject;
  execute(input: TInput, context: AgentContext): Promise<TOutput> | TOutput;
};

export function defineTool<TSchema extends StandardSchemaV1, TOutput>(
  tool: ToolConfigWithSchema<TSchema, TOutput>,
): Tool<StandardSchemaV1.InferOutput<TSchema>, TOutput>;
export function defineTool<TInput, TOutput>(
  tool: ToolConfigWithoutSchema<TInput, TOutput>,
): Tool<TInput, TOutput>;
export function defineTool(
  tool:
    | ToolConfigWithSchema<StandardSchemaV1, unknown>
    | ToolConfigWithoutSchema<unknown, unknown>,
): Tool<unknown, unknown> {
  const defined: Tool<unknown, unknown> = {
    name: tool.name,
    description: tool.description,
    execute: tool.execute,
    ...("inputSchema" in tool && tool.inputSchema
      ? { inputSchema: tool.inputSchema }
      : {}),
    ...(tool.parameters !== undefined ? { parameters: tool.parameters } : {}),
  };

  if (defined.parameters !== undefined || defined.inputSchema === undefined) {
    return defined;
  }

  const parameters = getSchemaJsonSchema(defined.inputSchema);

  if (parameters === undefined) {
    console.warn(
      `[agentstride] defineTool("${defined.name}"): inputSchema has no JSON Schema ` +
        `(Standard Schema \`~standard.jsonSchema\`). Tool parameters will be empty for the model. ` +
        `Use Zod 4+, or pass explicit \`parameters\`, so providers receive argument shapes.`,
    );
    return defined;
  }

  return {
    ...defined,
    parameters,
  };
}
