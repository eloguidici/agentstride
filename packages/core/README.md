# @agentstride/core

Small TypeScript agent runtime: tools, structured output, runs, events, hooks/guards.

Packages stay **private** until an explicit public release. Pre-1.0 freeze decisions: `docs/decisions/0013-pre-1.0-api-freeze.md`.

## Install (when published)

```bash
npm install @agentstride/core
```

Until then, use the monorepo workspace.

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

## Stable surface (keep)

- `createAgent`, `defineTool`, `asAgentTool`
- `AgentRun` as the success value (failures throw; optional `error.agentRun`)
- Standard Schema for tool input + structured output
- AbortSignal / `runWithDeadline`, nested cancel, `parentRunId` causality

## Out of core

Providers, RAG, MCP, NestJS, migrate helpers — separate packages.

## Docs

- Getting started: `docs/GETTING_STARTED.md`
- Layers + guides: `docs/guides/`
- Vision / architecture: `docs/vision.md`, `docs/architecture.md`
- Decisions: `docs/decisions/`
- Release posture: `docs/narrative/RELEASE_READINESS.md`
