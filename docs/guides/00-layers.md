# Layers: how to think about AgentStride

This is the implementer mental model. It is not a framework catalog.

Like distinguishing a **spec** from a **UI** from a **toolkit**, keep these layers separate when you build.

## The stack

```text
┌─────────────────────────────────────────────────────────┐
│  Your application (domain, HTTP, DB, policy, approvals) │
└───────────────────────────┬─────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────┐
│  Agent (`createAgent`) — loop, tools, structured output │
└─────────────┬─────────────────────────────┬─────────────┘
              │                             │
    ┌─────────▼─────────┐         ┌─────────▼─────────┐
    │  Model (provider) │         │  Tools (portable) │
    │  openai / custom  │         │  execute(input,…) │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                             │
              └─────────────┬───────────────┘
                            │
                  ┌─────────▼─────────┐
                  │  AgentRun + events │
                  │  (no global bus)  │
                  └───────────────────┘
```

| Layer | Owns | Does **not** own |
| --- | --- | --- |
| **App** | Domain rules, auth, approve/reject, idempotency keys, pricing, tickets | Model prompts as source of truth for policy |
| **Agent** | Tool loop, instructions, max steps, output schema validation | Workflow engine, global event bus |
| **Model** | Tokens in/out for one step (`Model` contract) | Your business entities |
| **Tool** | `execute(input, context)` side effects / reads | Runtime message DTOs |
| **AgentRun** | Status, steps, messages, lifecycle events, optional `parentRunId` | Distributed APM product |

Optional packages (`openai`, `nestjs`, `rag`, `mcp`, …) sit **beside** core. They must not force core growth ([ADR 0001](../decisions/0001-small-core.md)).

## Three sharp rules

1. **Tools are portable** — `execute(input, context)`, not framework message objects ([ADR 0002](../decisions/0002-tools-are-portable.md)).  
2. **No event bus in core** — correlation is run causality / delegation, not a global fabric ([ADR 0003](../decisions/0003-no-event-bus-in-core.md), [ADR 0011](../decisions/0011-run-causality.md)).  
3. **Sensitive actions are not self-approved** — the agent may *propose*; your app *approves* ([guide](./03-human-approval.md)).

## Where production concerns live

| Concern | Layer | Start here |
| --- | --- | --- |
| Cancel in-flight work | Agent + Model + nested tools | [Cancellation](./02-cancellation.md) |
| Human gate | **App** (+ propose tool) | [Human approval](./03-human-approval.md) |
| “Did the write already happen?” | **App** / domain | [Idempotency](./04-idempotent-side-effects.md) |
| Traces | App bridge from `AgentEvent` | [OTel](./05-observability-otel.md) |
| Decision quality | Eval harness outside core | [Evals](./06-evals.md) |

## Next

- [Getting started](../GETTING_STARTED.md)  
- [Architecture](../architecture.md)  
- [Vision](../vision.md)
