# Usage accounting (Track G)

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/usage-accounting`

## Context

ModelUsage existed on events but we lacked a small, documented way to aggregate run-level and eval-level operational metrics.

## Hypothesis

Derive counts/tokens/steps/duration from `AgentRun.events`; keep cost estimation behind external pricing inputs.

## Evidence

`examples/22-usage-accounting` — aggregateUsageFromRun / estimateCostUsd / aggregateUsageRows tests.

## Decision

Example/application helpers only. No prices in core. No `@agentstride/billing` package.

## Rejected

Hard-coded provider prices in core; mandatory cost fields on AgentRun.

## Result

Quality metrics can sit beside token/step usage. Cost remains an external overlay.

## Follow-up

See ADR 0013 for the pre-1.0 freeze decisions that followed this work.
