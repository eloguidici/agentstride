# ADR 0010 - Nested agent cancellation via asAgentTool

Status: Accepted

## Context

ADR 0009 gave top-level runs `AbortSignal` / `timeoutMs`, and tools may read `context.abortSignal`.

Enterprise validation (example 17) showed that `asAgentTool` forwarded `context` into the nested `agent.run`, but did **not** pass `run({ signal })`. The parent `runWithDeadline` could reject while a nested specialist model/tool kept working.

That is unsafe for HTTP disconnect and any outer cancel path that expects the whole local delegation tree to stop cooperating.

## Decision

`asAgentTool` reads the reserved `context.abortSignal` (when it is an `AbortSignal`) and forwards it as:

```ts
agent.run(input.request, { context, signal })
```

No new public options. No cancellation bus. Callers that never supply a parent signal behave as before (nested run still has its internal deadline controller from `runWithDeadline`).

## Rejected alternatives

1. **Expand AgentLike / execution context with dedicated cancel plumbing** — larger API for a one-line forward.
2. **Leave nested cancel as caller-managed** — rejects the demonstrated product need (HTTP close → nested work).
3. **Global abort registry / bus** — conflicts with ADR 0003 and small-core rules.

## Consequences

- Nested models receive `ModelRequest.signal` linked to the parent abort.
- Nested tools receive `context.abortSignal` from the nested run's combined signal.
- Cooperative work still required: ignoring the signal means in-flight work may continue until it notices or finishes (same honesty as ADR 0009).
- Parent/child run *causality* (ids) remains a separate track; this ADR only covers cancellation.
