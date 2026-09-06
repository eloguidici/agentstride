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

No secrets belong in the repository. Use environment variables.
