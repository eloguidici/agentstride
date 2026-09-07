# Multi-agent (local)

## Problem

You want specialists (read, draft, review) without a global event bus or a workflow engine.

## Rule

Compose **local** agents with `asAgentTool`. Keep approvals and policy in **your** app — not as agent self-approve tools.

## What to do

```ts
import { asAgentTool, createAgent, defineTool } from "@agentstride/core";

const librarian = createAgent({
  model,
  instructions: "Read-only specialist. Answer from tools.",
  tools: { /* read tools */ },
});

const desk = createAgent({
  model,
  instructions: "Orchestrator. Delegate reads via ask_librarian.",
  tools: {
    ask_librarian: asAgentTool(librarian, {
      name: "ask_librarian",
      description: "Ask the librarian",
    }),
    // propose_note_update: defineTool({ ... }) // app-owned; human approves outside
  },
});

await desk.run("What is next on the launch checklist?");
```

`asAgentTool` publishes `{ request: string }` parameters to the model, forwards `AbortSignal` and `parentRunId` into the nested run.

## Evidence

- ADR 0010 (nested cancel) · ADR 0011 (causality)
- `packages/core/test/agent-as-tool.test.mjs`
- Example: `examples/16-orchestrator-n-agents`

## Limits

- Local process only — not a distributed job fabric.
- Tool argument shapes for `defineTool` still need Zod 4+ (or explicit `parameters`).
- LLM copy quality is not the runtime’s job; use app-side critics/policy if needed.
