# ADR 0008 - Hooks and guards stay thin

Status: Accepted

## Context

Applications need cross-cutting behavior (logging, authz, timeouts) without forking the runtime.

## Decision

AgentStride supports small optional hooks and guards on `createAgent`:

- hooks: `beforeRun`, `beforeModel`, `afterModel`, `beforeTool`, `afterTool`, `onError`
- guards: `maxSteps`, `timeoutMs`, `allowedTools`, `deniedTools`

Hooks observe/intervene around lifecycle points.

Guards enforce hard limits.

This is not a policy engine. Approval UX, RBAC systems and cost budgets can use hooks/guards as integration points later.

## Consequences

Most apps can stay simple.

Complex authorization should live in application code or dedicated packages, not grow inside core.
