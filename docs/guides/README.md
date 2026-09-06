# Guides (implementers)

Short how-to pages for embedding AgentStride. Depth lives in ADRs and examples.

| Guide | Topic |
| --- | --- |
| [00 — Layers](./00-layers.md) | Mental model: app vs agent vs model vs tools vs run |
| [01 — First agent](./01-first-agent.md) | `createAgent` + `defineTool` |
| [02 — Cancellation](./02-cancellation.md) | `AbortSignal` and nested agents |
| [03 — Human approval](./03-human-approval.md) | Agent proposes; app approves |
| [04 — Idempotent side effects](./04-idempotent-side-effects.md) | Retries without double writes |
| [05 — Observability (OTel)](./05-observability-otel.md) | Spans without core lock-in |
| [06 — Evals](./06-evals.md) | Measure decisions, not only tools |
| [07 — Nest / HTTP embed](./07-nestjs-embed.md) | Put an agent behind an API |

Start here: [Getting started](../GETTING_STARTED.md).
