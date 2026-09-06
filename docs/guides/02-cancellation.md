# Cancellation

## Problem

`Promise.race` against a timeout does **not** stop in-flight model HTTP, tools, or nested agents.

## Rule

Pass cooperative `AbortSignal` through the run (and nested `asAgentTool` agents). Treat cancel as best-effort stop of work you control.

## What to do

```ts
const ac = new AbortController();
setTimeout(() => ac.abort(), 5_000);

await agent.run(input, { signal: ac.signal });
// or agent-level timeoutMs / runWithDeadline helpers in core
```

Providers should honor `ModelRequest.signal` (OpenAI adapter forwards it to `fetch`).

## Evidence

- [ADR 0009](../decisions/0009-abort-signal-cancellation.md)  
- [ADR 0010](../decisions/0010-nested-agent-cancellation.md)  
- `packages/core/test/nested-cancellation.test.mjs`  
- [research](../research/nested-cancellation.md)

## Limits

- Cancel is cooperative; a tool that ignores `context.signal` will keep running.  
- Not a distributed job-cancellation product.
