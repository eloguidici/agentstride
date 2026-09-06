# Getting started

Goal: run a minimal AgentStride agent in about ten minutes.

**Install** (published packages):

```bash
npm install @agentstride/core @agentstride/openai
```

Or clone this monorepo for examples and guides.

## 1. Mental model (2 minutes)

Read [Layers](./guides/00-layers.md). You need four words: **Agent**, **Model**, **Tool**, **AgentRun**.

## 2. Workspace setup

```bash
git clone <this-repo>
cd agentstride
npm install
npm run build -w @agentstride/core
```

## 3. Minimal agent (fake model)

Create a scratch file or follow [`examples/01-tool-agent`](../examples/01-tool-agent):

```ts
import { createAgent, defineTool } from "@agentstride/core";
import { z } from "zod";

const findCustomer = defineTool({
  name: "findCustomer",
  description: "Find a customer by id",
  inputSchema: z.object({ id: z.string() }),
  execute: ({ id }) => ({ id, name: "Ada" }),
});

const model = {
  async generate(request) {
    const tool = request.tools?.[0];
    const toolDone = request.messages.some((m) => m.role === "tool");
    if (!toolDone && tool) {
      return { toolCalls: [{ name: "findCustomer", input: { id: "42" } }] };
    }
    return {
      text: JSON.stringify({ summary: "found Ada" }),
      output: { summary: "found Ada" },
    };
  },
};

const agent = createAgent({
  model,
  instructions: "Use tools when helpful.",
  tools: { findCustomer },
});

const run = await agent.run("Find customer 42", {
  output: z.object({ summary: z.string() }),
});

console.log(run.status, run.output);
```

## 4. Real model (optional)

When you have an API key (OpenRouter or OpenAI-compatible):

```ts
import { createOpenAIModel } from "@agentstride/openai";

const model = createOpenAIModel({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: "https://openrouter.ai/api/v1",
  model: process.env.OPENROUTER_MODEL,
});
```

Live examples: [`examples/07-openai`](../examples/07-openai), [`examples/08-live-tool`](../examples/08-live-tool).  
See also [`packages/openai/README.md`](../packages/openai/README.md) for honest structured-output limits.

## 5. Prove packaging (optional)

Simulate an external consumer without publishing:

```bash
npm run package:dry-run
```

## 6. Where to go next

| If you care about… | Open |
| --- | --- |
| Embedding behind HTTP / Nest | [Nest guide](./guides/07-nestjs-embed.md), examples `18` / `26` |
| Cancellation | [guide](./guides/02-cancellation.md) |
| Human approval | [guide](./guides/03-human-approval.md) |
| Idempotent writes | [guide](./guides/04-idempotent-side-effects.md) |
| Tracing | [guide](./guides/05-observability-otel.md) |
| Decision evals | [guide](./guides/06-evals.md) |
| Full guide index | [guides/](./guides/README.md) |

## When not to use AgentStride

If you need a hosted control plane, durable distributed workflows, or a huge provider marketplace as the product — prefer a larger platform. AgentStride is a **small embeddable runtime** inside *your* backend ([vision](./vision.md)).
