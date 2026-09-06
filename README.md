# AgentStride

**A small, production-minded TypeScript runtime for portable AI agents — without adopting heavy orchestration too early.**

> Build simple. Grow deliberately.  
> Start lightweight. Stay if it is enough. Graduate if it is not.

**Status:** Public packages — `@agentstride/core` + `@agentstride/openai` at **`0.1.1`** (MIT). Pre-1.0 freeze notes: [ADR 0013](docs/decisions/0013-pre-1.0-api-freeze.md).

---

## The problem

Most agent stacks fail for *operational* reasons, not because the model cannot call a tool:

- complexity (buses, graphs, control planes) arrives before the product needs it;
- tools get glued to framework DTOs — and cancel/`await` timeouts fail to stop nested work;
- “approval” and writes happen inside the agent loop without real app control or idempotency;
- tests prove tools work, not that the **agent decided** correctly.

AgentStride keeps a small embeddable runtime and pushes domain, policy, and approvals into **your** application.

## What it adds

| Capability | What it does |
| --- | --- |
| **Small core** | `createAgent`, `defineTool`, structured output, `AgentRun` + lifecycle events — understandable in an afternoon |
| **Portable tools** | `execute(input, context)` — no runtime message DTOs required ([ADR 0002](docs/decisions/0002-tools-are-portable.md)) |
| **No global bus** | Local delegation + optional `parentRunId` instead of an event fabric ([ADR 0003](docs/decisions/0003-no-event-bus-in-core.md), [0011](docs/decisions/0011-run-causality.md)) |
| **Cooperative cancel** | `AbortSignal` through nested agents — not `Promise.race` theater ([ADR 0009](docs/decisions/0009-abort-signal-cancellation.md)–[0010](docs/decisions/0010-nested-agent-cancellation.md)) |
| **Provider-agnostic `Model`** | Bring any adapter; `@agentstride/openai` is the first practical one |
| **Optional packages** | RAG, memory, MCP, NestJS, migrate — beside core, not inside it |
| **Production patterns (examples)** | Human approval, idempotent writes, OTel bridge, Nest HTTP, decision evals — **evidence, not a certificate** |

Domain logic stays in your app. AgentStride does **not** ship a workflow engine, hosted control plane, or policy framework.

## Start here

1. Read the [layer model](docs/guides/00-layers.md) (Agent / Model / Tool / AgentRun / app).  
2. Follow [Getting started](docs/GETTING_STARTED.md).  
3. Pick one path from [Examples — Start here](examples/README.md).

```bash
npm install @agentstride/core @agentstride/openai
```

```ts
import { createAgent, defineTool } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";
import { z } from "zod";

const model = createOpenAIModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({ id: z.string() }),
  execute: ({ id }) => ({ id, name: "Ada" }),
});

const agent = createAgent({
  model,
  instructions: "Use tools when helpful.",
  tools: { findCustomer },
});

const run = await agent.run("Find customer 42", {
  output: z.object({ summary: z.string() }),
});
```

Working in this monorepo: `npm install && npm run build`.

---

## Architecture

```text
Your app (domain, HTTP, approve/reject, idempotency)
        │
        ▼
   Agent ──► Model ⇄ Tools ──► AgentRun (+ events)
                 │
                 └─ optional: openai | rag | memory | mcp | nestjs
```

More detail: [architecture](docs/architecture.md), [origins](docs/origins.md) (Receptionist / why the bus left).

## Production evidence (not a certificate)

| Concern | Where |
| --- | --- |
| Decision evals | [`evals/`](evals/), [guide](docs/guides/06-evals.md) |
| Human approval (agent ≠ approver) | [example 20](examples/20-human-approval/), [guide](docs/guides/03-human-approval.md) |
| Idempotent side effects | [example 21](examples/21-side-effect-idempotency/), [guide](docs/guides/04-idempotent-side-effects.md) |
| OpenTelemetry without core lock-in | [example 19](examples/19-opentelemetry-tracing/), [ADR 0012](docs/decisions/0012-opentelemetry-out-of-core.md) |
| Nest / HTTP embed | [examples 18](examples/18-enterprise-support-http/) / [26](examples/26-velum-grid-nestjs/), [guide](docs/guides/07-nestjs-embed.md) |
| Ops / compliance demos | Velum Grid [23](examples/23-alarm-triage/)–[25](examples/25-data-export/) |

## When not to use AgentStride

Prefer a larger framework or platform when you already need:

- durable distributed workflows / long-running graphs;
- a hosted agent control plane (deploy, sessions UI, sandboxes);
- a broad provider/integration catalog as the product;
- marketplace, scheduler, or channel product features.

AgentStride is for teams that want a **small embeddable runtime** inside their own backend.

## Portability / graduate path

Tools stay portable by design. `@agentstride/migrate` helps toward other ecosystems — with honest schema trade-offs in that package. Do not treat demo reuse percentages as marketing claims.

## Packages

| Package | Role | First public cut |
| --- | --- | --- |
| `@agentstride/core` | Runtime | **`0.1.1`** |
| `@agentstride/openai` | OpenAI-compatible `Model` | **`0.1.1`** |
| `rag` / `memory` / `mcp` / `nestjs` | Optional | Unpublished (in-repo) |
| `a2a` | Experimental remote sketch | Unpublished |
| `migrate` | Portability helpers | Unpublished |

npm: [`@agentstride/core`](https://www.npmjs.com/package/@agentstride/core) · [`@agentstride/openai`](https://www.npmjs.com/package/@agentstride/openai)

## Docs

- [Getting started](docs/GETTING_STARTED.md)
- [Guides](docs/guides/README.md)
- [Architecture](docs/architecture.md) · [Vision](docs/vision.md)
- [ADRs](docs/decisions/README.md)
- [Release notes](docs/RELEASE_NOTES.md)
- [Examples — Start here](examples/README.md)
- Maintainers: [CONTRIBUTING.md](CONTRIBUTING.md) · [PUBLISH.md](docs/PUBLISH.md)

## License

MIT.
