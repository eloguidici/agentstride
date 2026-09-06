# AgentStride

AgentStride is a lightweight TypeScript runtime for building portable AI agents without committing too early to a large framework.

> Build simple. Grow deliberately.  
> Start lightweight. Stay if it is enough. Graduate if it is not.

**Status:** repository is **private** while the public productization pack is prepared. Packages remain unpublished (`private: true`). Pre-1.0 freeze decisions: [ADR 0013](docs/decisions/0013-pre-1.0-api-freeze.md).

## What it is

A small **provider-agnostic** core (`createAgent`, `defineTool`, structured output, `AgentRun` events, cooperative cancellation, local delegation) plus **optional** packages for OpenAI-compatible models, RAG helpers, memory, MCP, NestJS and migration adapters.

Domain logic stays in your application. AgentStride does not ship a workflow engine, hosted control plane or policy framework.

## Quick start

```bash
npm install   # monorepo / local workspace today
npm run build
```

```ts
import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({ id: z.string() }),
  execute: ({ id }) => ({ id, name: "Ada" }),
});

const agent = createAgent({
  model, // any object implementing the Model contract
  instructions: "Use tools when helpful.",
  tools: { findCustomer },
});

const run = await agent.run("Find customer 42", {
  output: z.object({ summary: z.string() }),
});
```

Eventual public install (not enabled yet):

```bash
npm install @agentstride/core @agentstride/openai
```

## Why AgentStride

- **Small core** — understandable in an afternoon ([vision](docs/vision.md), [architecture](docs/architecture.md)).
- **Portable tools** — `execute(input, context)`; no runtime message DTOs required ([ADR 0002](docs/decisions/0002-tools-are-portable.md)).
- **Standard Schema** for tool input and structured output ([ADR 0005](docs/decisions/0005-tool-input-schemas.md) / [0006](docs/decisions/0006-structured-output.md)).
- **Explicit runs** — `AgentRun` + lifecycle events without a global bus ([ADR 0003](docs/decisions/0003-no-event-bus-in-core.md), [0007](docs/decisions/0007-agent-run-events.md)).
- **Cancellation & causality** — `AbortSignal` including nested agents; optional `parentRunId` ([ADR 0009](docs/decisions/0009-abort-signal-cancellation.md)–[0011](docs/decisions/0011-run-causality.md)).
- **Optional integrations** — OpenAI adapter, RAG, memory, MCP, NestJS live outside core.

## Production evidence (examples, not a certificate)

These slices show patterns we care about in real backends. They do **not** mean every deployment is “production-ready.”

| Concern | Where |
| --- | --- |
| Deterministic decision evals | [`evals/`](evals/), [research](docs/research/evaluation-harness.md) |
| Human approval (agent ≠ approver) | [example 20](examples/20-human-approval/), evals |
| Idempotent side effects | [example 21](examples/21-side-effect-idempotency/) |
| OpenTelemetry without core lock-in | [example 19](examples/19-opentelemetry-tracing/), [ADR 0012](docs/decisions/0012-opentelemetry-out-of-core.md) |
| Nest / enterprise HTTP | [examples 17–18](examples/), [26](examples/26-velum-grid-nestjs/) |
| Near-real ops / compliance demos | Velum Grid examples 23–25 |

## Architecture

```text
User → Agent → Model ⇄ Tools → AgentRun (+ events)
                 │
                 └─ optional: openai | rag | memory | mcp | nestjs
```

See [architecture](docs/architecture.md) and [origins](docs/origins.md) for the Receptionist / no-bus story.

## When not to use AgentStride

Prefer a larger framework or platform when you already need:

- durable distributed workflows / long-running graphs;
- a hosted agent control plane (deploy, sessions UI, sandboxes);
- a broad provider/integration catalog as the product;
- marketplace, scheduler or channel product features.

AgentStride is for teams that want a **small embeddable runtime** inside their own backend.

## Portability / graduate path

Tools are designed to stay portable. `@agentstride/migrate` exposes config helpers toward other ecosystems — with honest Zod/schema trade-offs documented in that package. Do not treat migration percentages in demos as marketing claims.

## Packages

| Package | Role | First-release posture |
| --- | --- | --- |
| `@agentstride/core` | Runtime | **Selected** (Gate 2) — publish at launch as `0.1.0` |
| `@agentstride/openai` | OpenAI-compatible `Model` | **Selected** (Gate 2) |
| `@agentstride/rag` / `memory` / `mcp` / `nestjs` | Optional | Deferred |
| `@agentstride/a2a` | Experimental remote sketch | Deferred |
| `@agentstride/migrate` | Portability helpers | Deferred |

Owner selected Gate 2 Option A. Nothing is published yet (`private: true`, versions still `0.0.0`). See [package scope](docs/narrative/INITIAL_PACKAGE_SCOPE_RECOMMENDATION.md) and [versioning](docs/narrative/VERSIONING_RECOMMENDATION.md).

## Docs

- [Current handoff](docs/handoffs/CURRENT_PROJECT_HANDOFF_2026-09-06.md)
- [Public productization plan](docs/plans/PUBLIC_PRODUCTIZATION_AND_RELEASE_DECISION_PLAN_2026-09-06.md)
- [Release readiness](docs/narrative/RELEASE_READINESS.md)
- [Story index](docs/narrative/story-index.md)
- [Decision log](docs/decisions/README.md)
- [Publish checklist](docs/PUBLISH.md)

## License

MIT. Repository remains private until an intentional public release approved by the owner.
