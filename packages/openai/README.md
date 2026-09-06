# @agentstride/openai

OpenAI-compatible Chat Completions adapter for AgentStride's `Model` contract.

Uses `fetch` directly — the `openai` SDK is not required. Works with OpenAI and gateways like OpenRouter.

```bash
npm install @agentstride/core @agentstride/openai
```

```ts
import { createAgent } from "@agentstride/core";
import { createOpenAIModel } from "@agentstride/openai";

const model = createOpenAIModel({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: "https://openrouter.ai/api/v1",
  model: process.env.OPENROUTER_MODEL,
});

const agent = createAgent({
  model,
  instructions: "Be concise.",
});
```

Peer dependency: `@agentstride/core@^0.1.0`.

## Cancellation

`ModelRequest.signal` is forwarded to `fetch`. Agent-level `timeoutMs` / `run({ signal })` can abort in-flight HTTP when the runtime passes the signal through.

## Structured output (honest limits)

When `request.outputSchema` is present, this adapter may:

1. hint the model with the JSON Schema in a system message;
2. request `response_format: { type: "json_object" }` (retried without it if the gateway rejects it);
3. best-effort `JSON.parse` of the assistant text into `response.output`.

That is **not** native schema enforcement. `@agentstride/core` always validates structured output with Standard Schema (`run(input, { output })`). Treat provider JSON mode as a hint only.

## Docs

- [Getting started](https://github.com/eloguidici/agentstride/blob/main/docs/GETTING_STARTED.md)
- [`@agentstride/core`](https://www.npmjs.com/package/@agentstride/core)
- [Guides](https://github.com/eloguidici/agentstride/tree/main/docs/guides)
- [Monorepo README](https://github.com/eloguidici/agentstride#readme)

## License

MIT
