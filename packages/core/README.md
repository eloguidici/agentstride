# @agentstride/core

**Purpose:** a small, embeddable TypeScript runtime for AI agents — tools, structured output, runs, events, hooks/guards — without pulling in a workflow engine or control plane.

**Good for:** POCs, demos, and spikes inside your app; same loop can grow into production patterns (cancel, external approvals, evals).

Keep domain logic, policy, and human approvals in **your** app. AgentStride runs the agent loop.

```bash
npm install @agentstride/core @agentstride/openai
```

Pair with a `Model` adapter — typically [`@agentstride/openai`](https://www.npmjs.com/package/@agentstride/openai).

Why this exists (problem + scope): [GitHub README](https://github.com/eloguidici/agentstride#readme).  
Pre-1.0 freeze: [ADR 0013](https://github.com/eloguidici/agentstride/blob/main/docs/decisions/0013-pre-1.0-api-freeze.md).

## Minimal usage

```ts
import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const echo = defineTool({
  name: "echo",
  description: "Echo text",
  inputSchema: z.object({ text: z.string() }),
  execute: ({ text }) => ({ text }),
});

const agent = createAgent({
  model,
  instructions: "Use tools when needed.",
  tools: { echo },
});

const run = await agent.run("hello", {
  output: z.object({ reply: z.string() }),
});
```

## Stable surface

- `createAgent`, `defineTool`, `asAgentTool`
- `AgentRun` as the success value (failures throw; optional `error.agentRun`)
- Standard Schema for tool input + structured output
- AbortSignal / `runWithDeadline`, nested cancel, `parentRunId` causality

## Out of core

Providers, RAG, MCP, NestJS, migrate helpers — separate packages (most unpublished in `0.1.x`).

## Docs

- [Getting started](https://github.com/eloguidici/agentstride/blob/main/docs/GETTING_STARTED.md)
- [Guides](https://github.com/eloguidici/agentstride/tree/main/docs/guides)
- [Architecture](https://github.com/eloguidici/agentstride/blob/main/docs/architecture.md) · [Vision](https://github.com/eloguidici/agentstride/blob/main/docs/vision.md)
- [ADRs](https://github.com/eloguidici/agentstride/tree/main/docs/decisions)
- [Monorepo README](https://github.com/eloguidici/agentstride#readme)

## License

MIT
