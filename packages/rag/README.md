# @agentstride/rag

Minimal retrieval helpers for AgentStride examples. Not a document platform.

```ts
import { createInMemoryRetriever, formatRetrievedContext } from "@agentstride/rag";

const retriever = createInMemoryRetriever([
  { id: "1", text: "Velum Grid runbook…" },
]);
const hits = await retriever.retrieve("runbook", { limit: 3 });
const context = formatRetrievedContext(hits);
```

Stay out of `@agentstride/core`. See enterprise examples `17` / `18` for usage.
