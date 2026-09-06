# Side-effect idempotency (Track F)

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/side-effect-idempotency`

## Context

Tool calls can succeed while the client loses the response; models can repeat tool calls; HTTP clients retry. Without idempotency keys, support cases duplicate.

## Hypothesis

Domain ownership of `tenantId + requestId + actionType` (plus in-flight dedupe) is enough â€” no core framework.

## Evidence

`examples/21-side-effect-idempotency` â€” 6 tests: duplicate key, concurrent race, lost response, agent double tool call â†’ one case.

## Decision

Keep idempotency in domain/application. Core unchanged.

## Rejected

Core idempotency middleware; workflow engine; durable distributed lock service for this proof.

## Result

Retries return `{ replayed: true }` with the same `caseId`.

## Follow-up

See usage-accounting research and example 22.
