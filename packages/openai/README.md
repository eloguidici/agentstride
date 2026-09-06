# @agentstride/openai

OpenAI Chat Completions adapter for AgentStride's `Model` contract.

Uses `fetch` directly so the `openai` SDK is not required.

```ts
import { createOpenAIModel } from "@agentstride/openai";

const model = createOpenAIModel({
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
});
```

No secrets belong in the repository. Use environment variables.
