# AgentStride

AgentStride is a small TypeScript runtime for building AI agents without committing too early to a large framework.

> Build simple. Grow deliberately.

This repository is still private while the API stabilizes.

## Install (workspace / local)

```bash
npm install
npm run build
```

Eventual public consumption model:

```bash
npm install @agentstride/core
```

Optional packages:

- `@agentstride/openai`
- `@agentstride/rag`
- `@agentstride/mcp`
- `@agentstride/memory`
- `@agentstride/nestjs`
- `@agentstride/a2a`
- `@agentstride/migrate`

## Quick start

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
  model,
  tools: { findCustomer },
});

const result = await agent.run("Find customer 42");
```

## Docs

- [Publish readiness](docs/PUBLISH.md)
- [Vision](docs/vision.md)
- [Architecture](docs/architecture.md)
- [Origins](docs/origins.md)
- [Use cases](docs/use-cases.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Current handoff](docs/handoffs/CURRENT_PROJECT_HANDOFF_2026-09-05.md)
- [Decision log](docs/decisions/README.md)
- [Development log](docs/development-log.md)

## Development continuity

AgentStride may be worked on from different development environments, including ChatGPT, Codex and Cursor.

The repository is intentionally documented so a new session can continue from the codebase rather than depending on previous chat history.

Start with [the current handoff](docs/handoffs/CURRENT_PROJECT_HANDOFF_2026-09-05.md) and [the implementation plan](docs/IMPLEMENTATION_PLAN.md).

## License

MIT. The repository remains private until an intentional public release.
