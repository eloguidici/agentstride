# ADR 0007 - AgentRun events without a bus

Status: Accepted

## Context

The older system used a global RxJS bus for agent communication and observation. ADR 0003 already rejects that for core.

We still need a way to observe a single run for tracing, hooks and debugging.

## Decision

Each `agent.run()` produces an `AgentRun` with:

- stable `id`;
- status / timing;
- messages and steps;
- an in-run `events` list;
- optional `onEvent` callback on the agent config.

Events describe lifecycle (`run:start`, `model:*`, `tool:*`, `run:end`, `run:error`).

They are not a communication channel between agents.

## Consequences

Observability works without OpenTelemetry or a global bus.

Multi-agent delegation must use explicit capability calls, not event subscription.
