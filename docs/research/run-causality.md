# Run causality / parentRunId (Track C)

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/run-causality`

## Context

Nested agents via `asAgentTool` had run ids, but no parent link. Audit could not answer which Receptionist run caused a SecurityAgent run without a bus.

## Hypothesis

Optional `parentRunId` set automatically by `asAgentTool` is enough for local trees.

## Evidence

- Core tests: top-level has no parent; nested links; siblings share parent; depth>1 chain; failed/cancelled retain parent.
- Example 17 integration: SecurityAgent `run:start.parentRunId ===` Receptionist `runId`.

## Decision

ADR 0011: `parentRunId` + reserved `context.agentRunId`; no registry; no `rootRunId` yet.

## Rejected

Bus/registry; mandatory correlation for all users; OTel-in-core; full field set now.

## Result

Local delegation trees are reconstructable. Callers who ignore causality see no breaking change.

## Next question

Track D: can lifecycle events map to OpenTelemetry without making OTel a core dependency?
