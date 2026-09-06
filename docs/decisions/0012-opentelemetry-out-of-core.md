# ADR 0012 - OpenTelemetry stays out of core

Status: Accepted

## Context

Production validation Track D asked whether AgentStride lifecycle data can map to OpenTelemetry without making OTel a core dependency.

## Decision

1. Keep `@agentstride/core` free of OpenTelemetry packages.
2. Prove the mapping in `examples/19-opentelemetry-tracing` using `AgentEvent` + `parentRunId`.
3. Do **not** publish `@agentstride/otel` until multiple real consumers need the same bridge and GenAI conventions stabilize further.
4. Privacy default in the proof: export ids, names, durations, usage, and input **length** — not full prompts or tool payloads.

## Rejected alternatives

| Option | Why rejected |
| --- | --- |
| OTel dependency in core | Couples runtime to one observability stack |
| Public `@agentstride/otel` now | One example is not enough demand evidence |
| Export prompts by default | Privacy / PII risk |

## Consequences

- Apps can attach `onEvent` bridges to any exporter they choose.
- Core remains provider- and observability-agnostic.
- Future optional package would wrap this example's lessons, not invent new core events.
