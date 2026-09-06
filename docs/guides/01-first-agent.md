# First agent

## Problem

You want a typed tool loop without a workflow graph or bus.

## Rule

Compose `defineTool` + any `Model` + `createAgent`. Domain stays in `execute`.

## Minimal shape

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
  model, // Model contract — fake or @agentstride/openai
  instructions: "Use echo when asked to repeat.",
  tools: { echo },
});

const run = await agent.run("say hi", {
  output: z.object({ reply: z.string() }),
});
```

Structured `output` is validated with Standard Schema in core ([ADR 0005](../decisions/0005-tool-input-schemas.md), [ADR 0006](../decisions/0006-structured-output.md)).

## Evidence

- [`examples/01-tool-agent`](../../examples/01-tool-agent)  
- [`packages/core/README.md`](../../packages/core/README.md)  
- [Getting started](../GETTING_STARTED.md)

## Limits

- A fake model is enough to learn the API; live quality depends on the provider.  
- `@agentstride/openai` JSON mode is a **hint**; core still validates ([openai README](../../packages/openai/README.md)).
