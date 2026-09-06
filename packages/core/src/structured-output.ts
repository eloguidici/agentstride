import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { SchemaIssue } from "./schema.js";
import { formatIssuePath } from "./schema-format.js";

export class StructuredOutputValidationError extends Error {
  readonly issues: readonly SchemaIssue[];

  constructor(issues: readonly SchemaIssue[]) {
    super(formatStructuredMessage(issues));
    this.name = "StructuredOutputValidationError";
    this.issues = issues;
  }
}

export async function parseWithSchema<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  value: unknown,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  let result: StandardSchemaV1.Result<StandardSchemaV1.InferOutput<TSchema>>;

  try {
    result = await schema["~standard"].validate(value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new StructuredOutputValidationError([{ message }]);
  }

  if (result.issues) {
    throw new StructuredOutputValidationError(result.issues);
  }

  return result.value;
}

export async function resolveStructuredOutput<TSchema extends StandardSchemaV1>(
  schema: TSchema,
  responseOutput: unknown,
  text: string,
): Promise<StandardSchemaV1.InferOutput<TSchema>> {
  if (responseOutput !== undefined) {
    return parseWithSchema(schema, responseOutput);
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new StructuredOutputValidationError([
      { message: "Model returned empty text and no structured output" },
    ]);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new StructuredOutputValidationError([
      { message: "Model text was not valid JSON" },
    ]);
  }

  return parseWithSchema(schema, parsed);
}

function formatStructuredMessage(issues: readonly SchemaIssue[]): string {
  const details = issues
    .map((issue) => {
      const path = formatIssuePath(issue.path);
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");

  return `Invalid structured output: ${details}`;
}
