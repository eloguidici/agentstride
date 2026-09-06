import type { SchemaIssue } from "./schema.js";

export function formatIssuePath(
  path: SchemaIssue["path"],
): string | undefined {
  if (!path || path.length === 0) {
    return undefined;
  }

  return path
    .map((segment) =>
      typeof segment === "object" && segment !== null && "key" in segment
        ? String(segment.key)
        : String(segment),
    )
    .join(".");
}
