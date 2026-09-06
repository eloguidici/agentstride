# Human approval

## Problem

If the agent both proposes and “approves” a sensitive side effect, you have theater — not control.

## Rule

**Agent proposes. Application approves.** Keep grant/execute in domain/HTTP handlers with real roles.

```text
User → Agent → tool: proposeX  →  pending record
App  → POST /…/approve|reject  →  domain execute (once)
```

## What to do

1. Tool creates a proposal / pending row (idempotent id).  
2. Agent result may set `requiresHumanApproval`-style flags — it must **not** execute.  
3. Separate endpoint or function checks actor role and executes.

## Evidence

- [`examples/20-human-approval`](../../examples/20-human-approval)  
- Velum Grid: [`23-alarm-triage`](../../examples/23-alarm-triage), [`24-change-gate`](../../examples/24-change-gate), [`25-data-export`](../../examples/25-data-export)  
- [research](../research/human-approval.md)  
- `evals/human-approval/`, `evals/alarm-triage/`

## Limits

- AgentStride is not a GRC / policy engine. Roles and audit are your app.  
- Do not add an “approve” tool that the same agent can call to finish the job.
