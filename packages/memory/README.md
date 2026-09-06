# @agentstride/memory

Small conversation memory adapters for AgentStride agents.

```ts
import { createInMemoryMemory } from "@agentstride/memory";

const memory = createInMemoryMemory();
await memory.save("thread-1", messages);
const loaded = await memory.load("thread-1");
```

Implements the `Memory` interface from `@agentstride/core`. Redis/Postgres adapters can be added later without changing that interface.
