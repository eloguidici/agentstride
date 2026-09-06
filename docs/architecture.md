# Architecture

AgentStride is organized as a monorepo of small packages.

## Core

`@agentstride/core` owns the execution loop:

```text
User -> Agent -> Model -> Tool? -> Model -> AgentRun
```

Important core ideas:

- portable tools (`execute(input, context)`)
- Standard Schema for tool input and structured output
- `AgentRun` + lifecycle events (no global bus)
- thin hooks and guards
- `AgentLike` for local (and later remote) delegation
- cooperative cancellation via `AbortSignal` (`run({ signal })`, `timeoutMs`, `ModelRequest.signal`)
- failed runs attach partial progress on `error.agentRun` (real `steps`, messages, events)

## Optional packages

| Package | Role |
| --- | --- |
| `@agentstride/openai` | OpenAI `Model` adapter |
| `@agentstride/rag` | Minimal retriever helpers |
| `@agentstride/mcp` | MCP-shaped tool bridge |
| `@agentstride/memory` | Conversation memory adapters |
| `@agentstride/nestjs` | NestJS module/providers |
| `@agentstride/a2a` | Experimental remote `AgentLike` |
| `@agentstride/migrate` | Portability helpers toward other frameworks |

## Design constraints

- provider SDKs stay out of core
- integrations must not force core growth
- examples are API tests, not marketing pages
