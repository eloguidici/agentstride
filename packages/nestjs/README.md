# @agentstride/nestjs

Optional NestJS integration helpers plus a real example app.

## Package

```ts
import { AgentStrideService, AGENTSTRIDE_AGENT } from "@agentstride/nestjs";
```

`AgentStrideModule.forRoot(...)` returns a Nest-compatible dynamic module object.

## Real example

See `examples/12-nestjs-app`:

- NestJS HTTP server
- `POST /agent/run`
- OpenRouter/OpenAI model
- typed tool
- injects `AgentStrideService`
