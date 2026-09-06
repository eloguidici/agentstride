# Observability (OpenTelemetry)

## Problem

You want traces for agent steps without locking `@agentstride/core` to an OTel SDK.

## Rule

Core emits **`AgentEvent` / run lifecycle**. Your app (or a thin bridge) maps events → spans. OTel stays out of core ([ADR 0012](../decisions/0012-opentelemetry-out-of-core.md)).

## What to do

1. Subscribe to run events (or walk `AgentRun` after the fact).  
2. Create spans for model/tool steps in your process.  
3. Propagate trace context with your HTTP middleware as usual.

## Evidence

- [`examples/19-opentelemetry-tracing`](../../examples/19-opentelemetry-tracing)  
- [ADR 0012](../decisions/0012-opentelemetry-out-of-core.md)  
- [research](../research/opentelemetry-proof.md)

## Limits

- Not a hosted APM.  
- GenAI semantic conventions still evolve — keep the bridge in app/examples until it stabilizes.
