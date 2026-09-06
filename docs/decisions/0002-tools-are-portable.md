# ADR 0002 - Tools should be portable

Status: Accepted

## Context

In the older multi-agent system, tools received runtime-specific message objects.

That made communication convenient inside that architecture, but it tied domain operations to the orchestration layer.

## Decision

A tool should receive typed input plus an optional execution context.

Conceptually:

```ts
execute(input, context)
```

It should not need to know about internal message envelopes, event buses or provider-specific tool call formats.

## Consequences

Adapters will have to translate model / framework calls into this contract.

That extra work is intentional because it keeps business logic reusable in plain TypeScript, tests, NestJS services or another agent framework.
