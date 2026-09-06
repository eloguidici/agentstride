# ADR 0009 - AbortSignal for timeout and cancellation

Status: Accepted

## Context

`timeoutMs` used `Promise.race`, which rejects the waiting `run()` call but does not cancel in-flight model HTTP calls or tools.

Consumers also need a way to cancel a run from outside (HTTP disconnect, UI cancel).

## Decision

1. Add optional `signal?: AbortSignal` on `AgentRunOptions`.
2. Add optional `signal?: AbortSignal` on `ModelRequest` so providers can pass it to `fetch`.
3. When `timeoutMs` is set, core creates an `AbortController`, aborts it on deadline, and runs the agent body against the combined signal.
4. Tools receive a reserved context key `abortSignal` (only when a signal exists). Domain code may ignore it. This avoids changing the `Tool.execute` signature.
5. Timeout failures throw `AgentRunTimeoutError`. External abort throws `AgentAbortError` (or rethrows if the signal reason is already an Error).

## Consequences

- Providers that ignore `signal` still time out at the agent layer (same limitation as before for in-flight work).
- `@agentstride/openai` should honor `request.signal`.
- Failed runs still attach partial `error.agentRun` with real `steps` / messages / events.
- No global cancellation bus.
