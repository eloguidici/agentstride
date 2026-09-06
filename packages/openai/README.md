# @agentstride/openai

OpenAI-compatible Chat Completions adapter for AgentStride's `Model` contract.

Uses `fetch` directly so the `openai` SDK is not required.

Works with OpenAI and gateways like OpenRouter.

```ts
import { createOpenAIModel } from "@agentstride/openai";

const model = createOpenAIModel({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseUrl: "https://openrouter.ai/api/v1",
  model: process.env.OPENROUTER_MODEL,
});
```

## Cancellation

`ModelRequest.signal` is forwarded to `fetch`. Agent-level `timeoutMs` / `run({ signal })` can therefore abort in-flight HTTP calls when the runtime passes the signal through.

## Structured output (honest limits)

When `request.outputSchema` is present, this adapter may:

1. hint the model with the JSON Schema in a system message;
2. request `response_format: { type: "json_object" }` (retried without it if the gateway rejects it);
3. best-effort `JSON.parse` of the assistant text into `response.output`.

That is **not** native schema enforcement. AgentStride core always validates structured output with Standard Schema (`run(input, { output })`). Treat provider JSON mode as a hint only.

No secrets belong in the repository. Use environment variables.
