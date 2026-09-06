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

See `examples/migration-shared` and examples `13` / `14` / `15` for a measured reuse demo.
