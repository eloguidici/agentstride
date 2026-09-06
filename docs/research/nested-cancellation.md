# Nested cancellation across asAgentTool (Track B)

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/nested-cancellation`

## Context

Outer `run({ signal })` aborted the waiting parent, but `asAgentTool` only passed `{ context }` into the nested agent. Nested models/tools could keep running after HTTP disconnect.

## Hypothesis

Forwarding `context.abortSignal` as nested `run({ signal })` is enough; no new AgentLike API or bus.

## Evidence

Before: documented gap in enterprise slice / api-review.

After (`packages/core/test/nested-cancellation.test.mjs`):

- parent abort → nested model sees `request.signal` and aborts;
- nested tool sees `context.abortSignal` and aborts;
- successful delegation unchanged;
- context (`tenantId`) still forwarded;
- no external signal → nested run still completes;
- already-aborted parent fails before nested work starts.

## Decision

Implement the one-line forward in `asAgentTool`. ADR 0010.

## Rejected

Larger AgentLike cancel API; caller-managed-only nested cancel; cancellation bus.

## Result

Local delegation cancel is cooperative end-to-end when work honors AbortSignal. Core API surface unchanged aside from behavior of `asAgentTool`.

## Next question

Track C: can we reconstruct parent/child run causality (`parentRunId`) without growing the API much?
