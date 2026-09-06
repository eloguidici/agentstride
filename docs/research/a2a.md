# A2A research notes

Status: exploratory (Phase 12)

## Goal

Determine whether local and remote agents can share AgentStride's `AgentLike` contract.

## Current conclusion

Yes at the capability boundary:

```ts
interface AgentLike<I = string, O = AgentRun> {
  run(input: I, options?: { context?: AgentContext }): Promise<O>;
}
```

A remote adapter can implement the same shape over HTTP.

## Open questions before a real protocol client

- Which A2A / agent-to-agent standard is stable enough to target?
- Authn/authz for capability discovery and invocation
- Streaming and long-running task lifecycle
- Error semantics and retries
- How much of the wire protocol belongs in `@agentstride/a2a` vs application code

## What we implemented now

`createRemoteAgent()` posts `{ input, context }` and expects an `AgentRun`-shaped JSON response.

That is enough to prove the local/remote symmetry idea without pretending the protocol work is done.
