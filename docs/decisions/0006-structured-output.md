# ADR 0006 - Structured output validated in core

Status: Accepted

## Context

Agents often need typed results, not only free text. Providers expose this differently (JSON mode, response_format, tool forcing, plain text JSON).

## Decision

Callers may pass a Standard Schema as `run(input, { output })`.

Core validates the final value before returning `result.output`.

Resolution order:

1. `ModelResponse.output` when the provider already returned structured data;
2. otherwise parse JSON from the final assistant text and validate that.

Provider-specific structured-output APIs stay in adapters. Core only receives optional structured data plus a portable schema.

## Consequences

- Callers stay provider-agnostic.
- Fake models and real providers can both satisfy the same contract.
- Invalid structured output fails with `StructuredOutputValidationError`.
