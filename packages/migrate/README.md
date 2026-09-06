# @agentstride/migrate

Portability helpers from AgentStride tools toward other frameworks.

```ts
import { toMastraToolConfig, toLangChainToolConfig } from "@agentstride/migrate";

const mastraConfig = toMastraToolConfig(tool);
const langchainConfig = toLangChainToolConfig(tool);
```

These helpers extract the reusable contract:

- name / id
- description
- schema
- execute / func

## Schema trade-off

`@agentstride/core` validates with **Standard Schema** (Zod is recommended, not required).

Mastra and LangChain tool APIs are Zod-shaped today, so this package's public types use `ZodType` for `inputSchema` / `schema`.

That does **not** make core Zod-dependent. It means:

- if your AgentStride tool used a non-Zod Standard Schema, you may need an adapter or to redefine the schema in Zod for the target framework;
- a generic `Standard Schema → Mastra/LangChain` converter is not provided yet — destination frameworks still expect Zod in practice, and inventing another layer would add complexity without a clear win.

See `examples/migration-shared` and examples `13` / `14` / `15` for a measured reuse demo.
