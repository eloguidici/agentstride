# ADR 0003 - No event bus in core

Status: Accepted

## Context

The earlier system used a global RxJS bus for agent-to-agent communication.

It enabled decoupling, but it also introduced subscription lifecycle issues, broadcast-style routing and more infrastructure than a simple agent call should require.

## Decision

AgentStride core will not require RxJS or a global event bus.

Execution events may still exist for tracing and observability, but they should describe lifecycle events rather than serve as the primary communication mechanism between agents.

## Consequences

Agent delegation will use explicit capability contracts first.

If distributed messaging is needed later, it should be added through adapters rather than redefining the core execution model.
