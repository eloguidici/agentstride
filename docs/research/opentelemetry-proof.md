# OpenTelemetry proof (Track D)

Date: 2026-09-06  
Status: Implemented  
Branch: `feature/opentelemetry-proof`

## Context

Backends need standard traces. We refused to put an event bus in core; the open question was whether `AgentEvent` + `parentRunId` are enough to map to OpenTelemetry.

## Hypothesis

An example-level bridge can produce GenAI-shaped spans (invoke_agent / chat / execute_tool) with nested parent links and privacy defaults — without any OTel import in core.

## Evidence

- `examples/19-opentelemetry-tracing`
- In-memory exporter tests: run/model/tool spans; nested parent link; failure status; privacy defaults; opt-in input
- Core `package.json` has no `@opentelemetry/*` dependency

## Decision

ADR 0012: OTel stays out of core; no public `@agentstride/otel` yet.

## Rejected

Core OTel; immediate public package; exporting prompts by default.

## Result

Working trace proof. Optional package deferred until demand + convention stability justify it.

## Next question

Track E: can human approval become an execution pattern (propose → approve → act) without a workflow engine?
