# OpenTelemetry tracing proof

Maps AgentStride `AgentEvent`s to OpenTelemetry spans **without** adding OTel to `@agentstride/core`.

## Why this exists

Production backends need standard observability. The question was whether AgentStride's lifecycle events are enough to build traces, or whether core must depend on OpenTelemetry.

**Answer from this example:** events + `parentRunId` are enough. OTel stays an application/example concern.

## Run

```bash
npm start -w @agentstride/example-opentelemetry-tracing
npm test -w @agentstride/example-opentelemetry-tracing
```

## Mapping

| AgentStride | OTel (GenAI conventions, Development) |
| --- | --- |
| `run:start` / `run:end` | `invoke_agent {name}` span |
| `model:start` / `model:end` | `chat {model}` span + `gen_ai.usage.*` |
| `tool:start` / `tool:end` | `execute_tool {tool}` span |
| `parentRunId` | child span parent context + `agentstride.run.parent_id` |
| `run:error` | span status ERROR + `error.type` |

## Privacy default

Exported by default:

- run / agent / tool ids and names
- input **length** (not text)
- token usage when present
- error type + short message

**Not** exported by default:

- full prompts
- tool arguments / results

Opt-in: `createAgentEventTracer({ includeInput: true })`.

## Package decision

A public `@agentstride/otel` package is **not** justified yet. This example is the proof. Extract a package only if multiple products need the same bridge and conventions stabilize further.
