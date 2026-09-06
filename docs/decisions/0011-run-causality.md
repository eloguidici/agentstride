# ADR 0011 - Parent/child run causality

Status: Accepted

## Context

Local multi-agent delegation via `asAgentTool` creates nested `AgentRun`s. Debugging and audit need to answer:

> Which Receptionist run caused this SecurityAgent run?

We previously used request correlation with a global event bus in an older architecture. AgentStride must recover the useful correlation without recovering the bus (ADR 0003).

## Decision

1. Add optional `parentRunId?: string` on `AgentRun` and `AgentRunOptions`.
2. Expose the current run id to tools via reserved context key `agentRunId` (same pattern as `abortSignal`).
3. `asAgentTool` sets `parentRunId` automatically from `context.agentRunId`.
4. Include optional `parentRunId` on `run:start` events so observers can reconstruct the tree without waiting for completion.
5. Do **not** add `rootRunId` or `toolCallId` until a product need forces them.
6. No global run registry in core.

Normal top-level callers ignore this: omit `parentRunId` and nothing changes.

## Rejected alternatives

| Option | Why rejected |
| --- | --- |
| Global run registry / bus | Conflicts with small-core and ADR 0003 |
| Always require correlation IDs from users | Ceremony for the common single-agent case |
| Full OpenTelemetry in core | Observability mapping is Track D; causality is local first |
| `rootRunId` + `toolCallId` now | Premature; `parentRunId` reconstructs the chain |

## Consequences

- Nested trees are reconstructable by walking `parentRunId`.
- Failed/cancelled nested runs retain `parentRunId` on `error.agentRun`.
- Distributed/A2A propagation remains out of scope.
