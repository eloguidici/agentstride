import type { StandardJSONSchemaV1, StandardSchemaV1 } from "@standard-schema/spec";

import { formatIssuePath } from "./schema-format.js";

export type { StandardSchemaV1 } from "@standard-schema/spec";

export type JsonSchemaObject = Readonly<Record<string, unknown>>;

export type SchemaIssue = StandardSchemaV1.Issue;

export class ToolInputValidationError extends Error {
  readonly toolName: string;
  readonly issues: readonly SchemaIssue[];

  constructor(toolName: string, issues: readonly SchemaIssue[]) {
    super(formatValidationMessage(toolName, issues));
    this.name = "ToolInputValidationError";
    this.toolName = toolName;
    this.issues = issues;
  }
}

export async function parseToolInput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  value: unknown,
  toolName: string,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  let result: StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;

  try {
    result = await schema["~standard"].validate(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ToolInputValidationError(toolName, [{ message }]);
  }

  if (result.issues) {
    throw new ToolInputValidationError(toolName, result.issues);
  }

  return result.value;
}

export function getSchemaJsonSchema(
  schema: StandardSchemaV1,
  target: StandardJSONSchemaV1.Target = "draft-07",
): JsonSchemaObject | undefined {
  const props = schema["~standard"] as StandardSchemaV1.Props &
    Partial<StandardJSONSchemaV1.Props>;

  if (!props.jsonSchema?.input) {
    return undefined;
  }

  try {
    return props.jsonSchema.input({ target });
  } catch {
    return undefined;
  }
}

function formatValidationMessage(
  toolName: string,
  issues: readonly SchemaIssue[],
): string {
  const details = issues
    .map((issue) => {
      const path = formatIssuePath(issue.path);
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");

  return `Invalid input for tool "${toolName}": ${details}`;
}
